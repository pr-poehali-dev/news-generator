import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ['IT', 'Криптовалюта', 'Игры', 'Финансы', 'Мир'];

export default function Admin() {
  const [selectedCategory, setSelectedCategory] = useState('IT');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('https://functions.poehali.dev/2cddb11e-55d0-46d8-b217-654842785853', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category: selectedCategory }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка генерации');
      }

      toast({
        title: 'Новость создана!',
        description: `Сгенерирована новость: "${data.title}" (${data.word_count} слов)`,
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось сгенерировать новость',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Админ-панель</h1>
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Icon name="ArrowLeft" className="mr-2 h-4 w-4" />
            На главную
          </Button>
        </div>

        <div className="grid gap-6 max-w-2xl">
          <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Icon name="Sparkles" className="h-5 w-5" />
                Генерация новостей
              </CardTitle>
              <CardDescription className="text-white/70">
                Создайте новую статью с помощью нейросети Groq
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  Категория
                </label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Генерирую статью...
                  </>
                ) : (
                  <>
                    <Icon name="Wand2" className="mr-2 h-4 w-4" />
                    Сгенерировать новость
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Icon name="Info" className="h-5 w-5" />
                Информация
              </CardTitle>
            </CardHeader>
            <CardContent className="text-white/80 space-y-2 text-sm">
              <p>• Используется бесплатная нейросеть Groq (LLaMA 3.3 70B)</p>
              <p>• Генерация занимает 30-60 секунд</p>
              <p>• Статьи проверяются на уникальность</p>
              <p>• Автоматическая генерация изображений</p>
              <p>• Подсчет количества слов в статье</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
