import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface NewsArticle {
  id: number;
  title: string;
  category: string;
  content: string;
  image_url: string;
  created_at: string;
  word_count: number;
  view_count: number;
}

export default function Admin() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const loadNews = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/ab1ca055-c853-4316-af54-562e2559e314');
      if (response.ok) {
        const data = await response.json();
        setNews(data);
      }
    } catch (error) {
      console.error('Error loading news:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  const handleGenerateNews = async () => {
    setGenerating(true);
    try {
      const response = await fetch('https://functions.poehali.dev/2cddb11e-55d0-46d8-b217-654842785853', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        toast({
          title: "Новость сгенерирована!",
          description: "Новая статья добавлена в базу данных"
        });
        await loadNews();
      } else {
        toast({
          title: "Ошибка",
          description: "Не удалось сгенерировать новость",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Проблема с подключением к серверу",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'IT': 'bg-blue-500',
      'Криптовалюта': 'bg-yellow-500',
      'Игры': 'bg-purple-500',
      'Финансы': 'bg-green-500',
      'Мир': 'bg-red-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#221F26] via-[#2a2730] to-[#221F26]">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMxRUFFREIiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0aDJWMGgtMnpNMzQgMTZoMlYyaC0yek0zMiAxOGgyVjRoLTJ6TTMwIDIwaDJWNmgtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
      
      <header className="relative border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/')}
                className="text-white hover:bg-white/10"
              >
                <Icon name="ArrowLeft" size={24} />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#1EAEDB] to-[#0c8cb8] rounded-lg flex items-center justify-center">
                  <Icon name="Settings" className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Админ-панель</h1>
                  <p className="text-xs text-gray-400">Управление новостями</p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleGenerateNews}
              disabled={generating}
              className="bg-gradient-to-r from-[#1EAEDB] to-[#0c8cb8] hover:from-[#0c8cb8] hover:to-[#1EAEDB] text-white border-0"
            >
              <Icon name={generating ? "Loader2" : "Zap"} className={generating ? "animate-spin mr-2" : "mr-2"} size={16} />
              {generating ? 'Генерация...' : 'Сгенерировать новость'}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-blue-400">Всего новостей</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{news.length}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-green-400">IT</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {news.filter(n => n.category === 'IT').length}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border-yellow-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-yellow-400">Криптовалюта</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {news.filter(n => n.category === 'Криптовалюта').length}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-purple-400">Игры</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {news.filter(n => n.category === 'Игры').length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Все новости</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Icon name="Loader2" className="animate-spin text-[#1EAEDB]" size={48} />
              </div>
            ) : (
              <div className="space-y-4">
                {news.map((article) => (
                  <div 
                    key={article.id}
                    className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`${getCategoryColor(article.category)} text-white border-0`}>
                            {article.category}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatDate(article.created_at)}
                          </span>
                        </div>
                        <h3 className="text-white font-semibold mb-2">{article.title}</h3>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Icon name="FileText" size={12} />
                            {article.word_count} слов
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon name="Eye" size={12} />
                            {article.view_count} просмотров
                          </span>
                        </div>
                      </div>
                      {article.image_url && (
                        <img 
                          src={article.image_url} 
                          alt={article.title}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
