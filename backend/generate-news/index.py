'''
Business: Generate AI news article and save to database
Args: event with httpMethod POST; context with request_id
Returns: HTTP response with generated news article
'''

import json
import os
import psycopg2
import random
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
    
    if not openai_key:
        categories = ['IT', 'Криптовалюта', 'Игры', 'Финансы', 'Мир']
        category = random.choice(categories)
        
        demo_titles = {
            'IT': 'Новая версия Python 3.13 выпущена с улучшенной производительностью',
            'Криптовалюта': 'Bitcoin достиг нового исторического максимума',
            'Игры': 'Анонсирована новая часть популярной игровой франшизы',
            'Финансы': 'Центробанк снизил ключевую ставку на 0.5%',
            'Мир': 'Международный саммит по климату завершился подписанием соглашения'
        }
        
        title = demo_titles[category]
        content = f"Это демонстрационная новость для категории {category}. " * 100
        word_count = len(content.split())
        
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        
        cur.execute('''
            INSERT INTO news (title, category, content, image_url, word_count, view_count)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id, title, category, content, image_url, created_at, word_count, view_count
        ''', (title, category, content, 'https://placehold.co/600x400/1EAEDB/FFFFFF/png?text=' + category, word_count, 0))
        
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
    
    return {
        'statusCode': 501,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'OpenAI integration coming soon'}),
        'isBase64Encoded': False
    }
