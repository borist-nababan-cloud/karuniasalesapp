import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/authStore";
import { getSupabaseMedia } from "@/lib/url";

export default function HomePage() {
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const { data, error } = await supabase
                    .from('articles')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(2);
                
                if (error) throw error;
                setArticles(data || []);
            } catch (err) {
                console.error("Failed to fetch articles", err);
            } finally {
                setLoading(false);
            }
        };

        fetchArticles();
    }, []);

    const getImageUrl = (article: any) => {
        return article.cover_url || article.coverUrl || article.cover;
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">Welcome, {(user as any)?.user_metadata?.username || user?.email}</h1>
                <p className="text-muted-foreground">Latest News & Updates</p>
            </div>

            {loading ? (
                <div className="text-center py-8 text-gray-500">Loading articles...</div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {articles.map((article) => {
                        const imageUrl = getImageUrl(article);
                        const fullImageUrl = getSupabaseMedia(imageUrl);

                        return (
                            <Card key={article.id} className="overflow-hidden">
                                {fullImageUrl && (
                                    <div className="w-full aspect-video bg-gray-100 relative">
                                        <img
                                            src={fullImageUrl}
                                            alt={article.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                <CardHeader>
                                    <CardTitle className="text-xl line-clamp-1">{article.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600 whitespace-pre-wrap text-sm leading-relaxed">
                                        {article.description}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}

                    {articles.length === 0 && (
                        <div className="col-span-2 text-center py-10 text-gray-400 border rounded-lg bg-gray-50">
                            No articles found.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
