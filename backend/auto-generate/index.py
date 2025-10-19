'''
Business: Auto-generate news articles for all categories (triggered by cron/scheduler)
Args: event with httpMethod GET
Returns: HTTP response with generation results
'''

import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any, List
import requests
from difflib import SequenceMatcher
from datetime import datetime, timedelta

CATEGORIES = ['IT', 'Криптовалюта', 'Игры', 'Финансы', 'Мир']

def check_similarity(text1: str, text2: str) -> float:
    return SequenceMatcher(None, text1.lower(), text2.lower()).ratio()

def check_plagiarism(content: str, existing_articles: List[Dict]) -> bool:
    for article in existing_articles:
        similarity = check_similarity(content, article['content'])
        if similarity > 0.7:
            return True
    return False

def generate_with_openai(category: str, existing_titles: List[str]) -> Dict[str, str]:
    api_key = os.environ.get('OPENAI_API_KEY')
    if not api_key:
        raise ValueError('OPENAI_API_KEY not configured')
    
    existing_titles_text = '\n'.join([f"- {title}" for title in existing_titles[-10:]])
    
    prompt = f"""Создай уникальную новостную статью на русском языке для категории "{category}".

ВАЖНО: Не повторяй эти темы:
{existing_titles_text}

Требования:
- Статья должна быть на 5000+ слов
- Тема должна быть актуальной и интересной
- Используй реальные технологии/компании/события
- Структура: введение, основная часть с подзаголовками, заключение
- Пиши профессионально, как журналист топового издания

Верни JSON:
{{
  "title": "Заголовок новости",
  "content": "Полный текст статьи 5000+ слов"
}}"""

    response = requests.post(
        'https://api.openai.com/v1/chat/completions',
        headers={
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        },
        json={
            'model': 'gpt-4o-mini',
            'messages': [
                {'role': 'system', 'content': 'Ты профессиональный журналист, пишущий длинные аналитические статьи.'},
                {'role': 'user', 'content': prompt}
            ],
            'temperature': 0.9,
            'max_tokens': 16000
        },
        timeout=120
    )
    
    if response.status_code != 200:
        raise Exception(f'OpenAI API error: {response.text}')
    
    result = response.json()
    content = result['choices'][0]['message']['content']
    
    content = content.strip()
    if content.startswith('```json'):
        content = content[7:]
    if content.startswith('```'):
        content = content[3:]
    if content.endswith('```'):
        content = content[:-3]
    content = content.strip()
    
    article_data = json.loads(content)
    return article_data

def generate_image(title: str) -> str:
    return f'https://picsum.photos/seed/{hash(title)}/1200/630'

def check_recent_generation(cur, category: str) -> bool:
    five_minutes_ago = datetime.now() - timedelta(minutes=5)
    cur.execute(
        """SELECT COUNT(*) as count FROM news_articles 
           WHERE category = %s AND created_at > %s""",
        (category, five_minutes_ago)
    )
    result = cur.fetchone()
    return result['count'] > 0

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'DATABASE_URL not configured'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(db_url)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    results = []
    
    for category in CATEGORIES:
        if check_recent_generation(cur, category):
            results.append({
                'category': category,
                'status': 'skipped',
                'message': 'Recently generated'
            })
            continue
        
        cur.execute(
            "SELECT title, content FROM news_articles WHERE category = %s ORDER BY created_at DESC LIMIT 20",
            (category,)
        )
        existing_articles = cur.fetchall()
        existing_titles = [article['title'] for article in existing_articles]
        
        max_attempts = 3
        success = False
        
        for attempt in range(max_attempts):
            try:
                article_data = generate_with_openai(category, existing_titles)
                
                if not check_plagiarism(article_data['content'], existing_articles):
                    title = article_data['title']
                    content = article_data['content']
                    word_count = len(content.split())
                    image_url = generate_image(title)
                    
                    cur.execute(
                        """INSERT INTO news_articles (title, content, category, image_url, word_count, view_count)
                           VALUES (%s, %s, %s, %s, %s, 0)
                           RETURNING id""",
                        (title, content, category, image_url, word_count)
                    )
                    
                    new_id = cur.fetchone()['id']
                    conn.commit()
                    
                    cur.execute(
                        "INSERT INTO generation_log (category, status) VALUES (%s, %s)",
                        (category, 'success')
                    )
                    conn.commit()
                    
                    results.append({
                        'category': category,
                        'status': 'success',
                        'article_id': new_id,
                        'word_count': word_count
                    })
                    success = True
                    break
            except Exception as e:
                if attempt == max_attempts - 1:
                    cur.execute(
                        "INSERT INTO generation_log (category, status, error_message) VALUES (%s, %s, %s)",
                        (category, 'error', str(e))
                    )
                    conn.commit()
                    
                    results.append({
                        'category': category,
                        'status': 'error',
                        'message': str(e)
                    })
        
        if not success and attempt == max_attempts - 1:
            results.append({
                'category': category,
                'status': 'failed',
                'message': 'Plagiarism check failed after 3 attempts'
            })
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'generated': len([r for r in results if r['status'] == 'success']),
            'results': results
        }),
        'isBase64Encoded': False
    }
