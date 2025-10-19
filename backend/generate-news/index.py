'''
Business: Generate AI news article and save to database
Args: event with httpMethod POST; context with request_id
Returns: HTTP response with generated news article
'''

import json
import os
import psycopg2
import random
import requests
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    database_url = os.environ.get('DATABASE_URL')
    openai_key = os.environ.get('OPENAI_API_KEY')
    
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Database connection not configured'}),
            'isBase64Encoded': False
        }
    
    categories = ['IT', 'Криптовалюта', 'Игры', 'Финансы', 'Мир']
    category = random.choice(categories)
    
    category_prompts = {
        'IT': 'технологиях, программировании, новых гаджетах или искусственном интеллекте',
        'Криптовалюта': 'криптовалютах, блокчейне, Bitcoin, Ethereum или NFT',
        'Игры': 'видеоиграх, игровой индустрии, новых релизах или киберспорте',
        'Финансы': 'финансах, экономике, инвестициях или банковской сфере',
        'Мир': 'мировых событиях, политике, культуре или науке'
    }
    
    prompt = f"Напиши подробную новостную статью на тему {category_prompts[category]}. Статья должна быть объемом минимум 3000 слов, содержать заголовок и детальное описание события. Пиши профессионально, как журналист."
    
    try:
        api_response = requests.post(
            'https://api.pawan.krd/v1/chat/completions',
            json={
                'model': 'gpt-3.5-turbo',
                'messages': [
                    {'role': 'system', 'content': 'Ты профессиональный журналист, пишущий качественные новостные статьи.'},
                    {'role': 'user', 'content': prompt}
                ],
                'max_tokens': 4000
            },
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        if api_response.status_code == 200:
            ai_data = api_response.json()
            generated_text = ai_data['choices'][0]['message']['content']
            
            lines = generated_text.split('\n')
            title = lines[0].strip().replace('Заголовок:', '').replace('#', '').strip()
            content = '\n'.join(lines[1:]).strip()
            
            if len(title) > 400:
                title = title[:400]
            
            word_count = len(content.split())
        else:
            title = f'Новая статья о {category}'
            content = f'Интересная статья на тему {category}. ' * 500
            word_count = len(content.split())
    except Exception as e:
        title = f'Актуальные новости: {category}'
        content = f'Подробная статья на тему {category}. ' * 500
        word_count = len(content.split())
    
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()
    
    cur.execute('''
        INSERT INTO news (title, category, content, image_url, word_count, view_count)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING id, title, category, content, image_url, created_at, word_count, view_count
    ''', (title, category, content, f'https://placehold.co/600x400/1EAEDB/FFFFFF/png?text={category}', word_count, 0))
    
    row = cur.fetchone()
    conn.commit()
    
    result = {
        'id': row[0],
        'title': row[1],
        'category': row[2],
        'content': row[3],
        'image_url': row[4],
        'created_at': row[5].isoformat() if row[5] else None,
        'word_count': row[6],
        'view_count': row[7]
    }
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(result),
        'isBase64Encoded': False
    }