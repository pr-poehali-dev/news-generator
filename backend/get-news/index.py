'''
Business: Fetch news articles from database with filtering and pagination
Args: event with httpMethod GET, query params for category and limit
Returns: HTTP response with array of news articles
'''

import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
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
    
    query_params = event.get('queryStringParameters') or {}
    category = query_params.get('category')
    limit = int(query_params.get('limit', 100))
    
    conn = psycopg2.connect(db_url)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    if category:
        cur.execute(
            """SELECT id, title, content, category, image_url, word_count, created_at, view_count
               FROM news_articles 
               WHERE category = %s 
               ORDER BY created_at DESC 
               LIMIT %s""",
            (category, limit)
        )
    else:
        cur.execute(
            """SELECT id, title, content, category, image_url, word_count, created_at, view_count
               FROM news_articles 
               ORDER BY created_at DESC 
               LIMIT %s""",
            (limit,)
        )
    
    articles = cur.fetchall()
    
    result = []
    for article in articles:
        result.append({
            'id': article['id'],
            'title': article['title'],
            'content': article['content'],
            'category': article['category'],
            'image_url': article['image_url'],
            'word_count': article['word_count'],
            'created_at': article['created_at'].isoformat(),
            'view_count': article['view_count']
        })
    
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
