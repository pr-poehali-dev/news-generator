import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

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

const categories = [
  { name: 'Все', value: 'all', icon: 'Newspaper' },
  { name: 'IT', value: 'IT', icon: 'Code' },
  { name: 'Криптовалюта', value: 'Криптовалюта', icon: 'Bitcoin' },
  { name: 'Игры', value: 'Игры', icon: 'Gamepad2' },
  { name: 'Финансы', value: 'Финансы', icon: 'TrendingUp' },
  { name: 'Мир', value: 'Мир', icon: 'Globe' }
];

export default function Index() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsArticle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  const loadNews = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/af8bded5-e442-41d9-b777-b7b7c0f5a349');
      if (response.ok) {
        const data = await response.json();
        setNews(data);
        setFilteredNews(data);
      }
    } catch (error) {
      console.error('Failed to load news:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
    const interval = setInterval(loadNews, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let filtered = news;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredNews(filtered);
  }, [selectedCategory, searchQuery, news]);

  const handleGenerateNews = async () => {
    setGenerating(true);
    try {
      const response = await fetch('https://functions.poehali.dev/2cddb11e-55d0-46d8-b217-654842785853', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          category: selectedCategory === 'all' ? 'IT' : selectedCategory 
        })
      });

      if (response.ok) {
        const newArticle = await response.json();
        setNews(prev => [newArticle, ...prev]);
        toast({
          title: "Новость сгенерирована!",
          description: `Статья "${newArticle.title}" успешно создана`,
        });
      } else {
        const error = await response.json();
        toast({
          title: "Ошибка генерации",
          description: error.error || "Не удалось сгенерировать новость",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось подключиться к серверу",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] -z-10"></div>
      
      <header className="relative border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#1EAEDB] to-[#0c8cb8] rounded-xl flex items-center justify-center shadow-lg shadow-[#1EAEDB]/20">
                <Icon name="Newspaper" className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">NewsAI</h1>
                <p className="text-gray-400 text-sm">Новости созданные ИИ</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => navigate('/admin')}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Icon name="Settings" className="mr-2" size={16} />
                Админ-панель
              </Button>
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
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <Input 
                placeholder="Поиск новостей..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#1EAEDB]"
              />
            </div>
          </div>
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
          <TabsList className="bg-white/5 border border-white/10 p-1 flex-wrap h-auto gap-2">
            {categories.map((cat) => (
              <TabsTrigger 
                key={cat.value} 
                value={cat.value}
                className="data-[state=active]:bg-[#1EAEDB] data-[state=active]:text-white text-gray-400 hover:text-white transition-all"
              >
                <Icon name={cat.icon as any} size={16} className="mr-2" />
                {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Icon name="Loader2" className="animate-spin text-[#1EAEDB]" size={48} />
          </div>
        ) : filteredNews.length === 0 ? (
          <Card className="bg-white/5 border-white/10 text-center py-20">
            <CardContent className="pt-6">
              <Icon name="FileQuestion" className="mx-auto mb-4 text-gray-500" size={64} />
              <h3 className="text-xl font-semibold text-white mb-2">Новости не найдены</h3>
              <p className="text-gray-400">Попробуйте изменить категорию или сгенерировать новую новость</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredNews.map((article) => (
              <Card 
                key={article.id}
                className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-[#1EAEDB]/50 transition-all duration-300 overflow-hidden"
              >
                <div className="flex items-start gap-4 p-6">
                  {article.image_url && (
                    <div 
                      className="relative w-32 h-32 flex-shrink-0 overflow-hidden rounded-lg cursor-pointer"
                      onClick={() => navigate(`/news/${article.id}`)}
                    >
                      <img 
                        src={article.image_url} 
                        alt={article.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                      <Badge className="absolute top-2 right-2 bg-[#1EAEDB]/90 text-white border-0 text-xs">
                        {article.category}
                      </Badge>
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h3 
                      className="text-xl font-bold text-white mb-2 hover:text-[#1EAEDB] transition-colors cursor-pointer"
                      onClick={() => navigate(`/news/${article.id}`)}
                    >
                      {article.title}
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Icon name="Calendar" size={12} />
                        {formatDate(article.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="Eye" size={12} />
                        {article.view_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="FileText" size={12} />
                        {article.word_count} слов
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                      {article.content}
                    </p>
                    <Button
                      onClick={() => navigate(`/news/${article.id}`)}
                      variant="outline"
                      size="sm"
                      className="border-[#1EAEDB]/50 text-[#1EAEDB] hover:bg-[#1EAEDB]/10"
                    >
                      Читать полностью
                      <Icon name="ArrowRight" className="ml-2" size={14} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <footer className="relative border-t border-white/10 bg-black/20 backdrop-blur-md mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-white font-semibold mb-3">NewsAI</h4>
              <p className="text-gray-400 text-sm">Автоматическая генерация новостей с помощью искусственного интеллекта</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Категории</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>IT</li>
                <li>Криптовалюта</li>
                <li>Игры</li>
                <li>Финансы</li>
                <li>Мир</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">О проекте</h4>
              <p className="text-gray-400 text-sm">Новости генерируются автоматически каждые 5 минут с использованием GPT-4</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Контакты</h4>
              <p className="text-gray-400 text-sm">© 2025 NewsAI. Все права защищены.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}