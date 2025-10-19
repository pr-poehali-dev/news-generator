import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Loader2 } from 'lucide-react';

interface NewsArticle {
  id: number;
  title: string;
  content: string;
  category: string;
  image_url: string;
  word_count: number;
  view_count: number;
  created_at: string;
}

export default function NewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/d2ba2aca-bc92-410e-a5ed-a3f14a22b0dc');
      const data = await response.json();
      const found = data.news.find((n: NewsArticle) => n.id === Number(id));
      setArticle(found || null);
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-white/10 border-white/20 backdrop-blur-lg p-8">
          <p className="text-white text-center mb-4">Новость не найдена</p>
          <Button onClick={() => navigate('/')} className="w-full">
            На главную
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="mb-6 bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <Icon name="ArrowLeft" className="mr-2 h-4 w-4" />
          Назад к новостям
        </Button>

        <Card className="bg-white/10 border-white/20 backdrop-blur-lg overflow-hidden">
          <img
            src={article.image_url}
            alt={article.title}
            className="w-full h-96 object-cover"
          />
          
          <CardContent className="p-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
                {article.category}
              </Badge>
              <span className="text-white/60 text-sm flex items-center gap-1">
                <Icon name="Calendar" className="h-4 w-4" />
                {new Date(article.created_at).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>

            <h1 className="text-4xl font-bold text-white mb-6">
              {article.title}
            </h1>

            <div className="flex items-center gap-4 mb-8 text-white/60 text-sm">
              <span className="flex items-center gap-1">
                <Icon name="FileText" className="h-4 w-4" />
                {article.word_count} слов
              </span>
              <span className="flex items-center gap-1">
                <Icon name="Eye" className="h-4 w-4" />
                {article.view_count} просмотров
              </span>
            </div>

            <div className="prose prose-invert prose-lg max-w-none">
              {article.content.split('\n').map((paragraph, index) => (
                <p key={index} className="text-white/90 mb-4 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
