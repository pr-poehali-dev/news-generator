import { useState, useEffect } from 'react';
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

  const loadNews = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/ab1ca055-c853-4316-af54-562e2559e314');
      if (response.ok) {
        const data = await response.json();
        setNews(data);
        setFilteredNews(data);
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

  useEffect(() => {
    let filtered = news;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query)
      );
    }
    
    setFilteredNews(filtered);
  }, [selectedCategory, searchQuery, news]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#221F26] via-[#2a2730] to-[#221F26]">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMxRUFFREIiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0aDJWMGgtMnpNMzQgMTZoMlYyaC0yek0zMiAxOGgyVjRoLTJ6TTMwIDIwaDJWNmgtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
      
      <header className="relative border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#1EAEDB] to-[#0c8cb8] rounded-lg flex items-center justify-center">
                <Icon name="Sparkles" className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">NewsAI</h1>
                <p className="text-xs text-gray-400">Автогенератор новостей</p>
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
        <div className="mb-8 relative">
          <Input
            type="text"
            placeholder="Поиск новостей..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#1EAEDB]"
          />
          <Icon name="Search" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
          <TabsList className="w-full justify-start bg-white/5 border border-white/10 p-1 gap-2 flex-wrap h-auto">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat.value}
                value={cat.value}
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1EAEDB] data-[state=active]:to-[#0c8cb8] data-[state=active]:text-white text-gray-400 hover:text-white transition-all"
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredNews.map((article) => (
              <Card 
                key={article.id}
                className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-[#1EAEDB]/50 transition-all duration-300 overflow-hidden group cursor-pointer"
              >
                {article.image_url && (
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={article.image_url} 
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <Badge className="absolute top-3 right-3 bg-[#1EAEDB]/90 text-white border-0">
                      {article.category}
                    </Badge>
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle className="text-white group-hover:text-[#1EAEDB] transition-colors line-clamp-2">
                    {article.title}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
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
                </CardHeader>
                
                <CardContent>
                  <p className="text-gray-400 text-sm line-clamp-3">
                    {article.content}
                  </p>
                  <Button 
                    variant="link" 
                    className="px-0 text-[#1EAEDB] hover:text-[#0c8cb8] mt-3"
                  >
                    Читать полностью
                    <Icon name="ArrowRight" size={16} className="ml-1" />
                  </Button>
                </CardContent>
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
              <h4 className="text-white font-semibold mb-3">Навигация</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Главная</li>
                <li>Архив</li>
                <li>Поиск</li>
                <li>Админ-панель</li>
              </ul>
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