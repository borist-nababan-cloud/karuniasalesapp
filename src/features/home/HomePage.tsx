import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';
import { useAuthStore } from "@/stores/authStore";
import { getSupabaseMedia } from "@/lib/url";
import { 
    fetchLatestArticles, 
    computeDashboardKPIs, 
    aggregateSalesTrend, 
    aggregateTopVehicles, 
    aggregateLeasingDistribution,
    formatCurrency
} from '@karunia/shared';
import { 
    BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, Legend 
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function HomePage() {
    const [articles, setArticles] = useState<any[]>([]);
    const [kpiData, setKpiData] = useState<any>(null);
    const [trendData, setTrendData] = useState<any[]>([]);
    const [vehicleData, setVehicleData] = useState<any[]>([]);
    const [leasingData, setLeasingData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user?.id) return;
            try {
                // Fetch Articles
                const articlesData = await fetchLatestArticles(supabase, 2);
                setArticles(articlesData || []);

                // Fetch SPKs for Analytics
                const { data: profile } = await supabase
                    .from('sales_profiles')
                    .select('id')
                    .eq('sales_uid', user.id)
                    .maybeSingle();

                let query = supabase
                    .from('spks')
                    .select(`
                        *,
                        spk_section_units(*, vehicle_types(name)),
                        spk_section_payments(*)
                    `)
                    .order('created_at', { ascending: false });

                if (profile?.id) {
                    query = query.eq('sales_profile_id', profile.id);
                } else {
                    query = query.eq('created_by', user.id);
                }

                const { data: spks, error } = await query;
                if (!error && spks) {
                    setKpiData(computeDashboardKPIs(spks));
                    setTrendData(aggregateSalesTrend(spks));
                    setVehicleData(aggregateTopVehicles(spks));
                    setLeasingData(aggregateLeasingDistribution(spks));
                }

            } catch (err) {
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user?.id]);

    const getImageUrl = (article: any) => {
        return article.cover_url || article.coverUrl || article.cover;
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
                <p className="text-muted-foreground">Welcome back, {(user as any)?.user_metadata?.username || user?.email}</p>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : (
                <>
                    {/* KPI CARDS */}
                    {kpiData && (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total SPK (This Month)</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{kpiData.totalSpk}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Revenue (OTR)</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{formatCurrency(kpiData.totalRevenue)}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Pending Follow-ups</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-amber-600">{kpiData.pendingFollowUps}</div>
                                    <p className="text-xs text-muted-foreground">On Progress SPKs</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Payment Methods</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{kpiData.creditRatio}% Credit</div>
                                    <p className="text-xs text-muted-foreground">{kpiData.cashRatio}% Cash</p>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* CHARTS */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card className="col-span-2">
                            <CardHeader>
                                <CardTitle>Sales Trend (Last 7 Days)</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={trendData}>
                                        <XAxis dataKey="date" />
                                        <YAxis allowDecimals={false} />
                                        <RechartsTooltip />
                                        <Bar dataKey="sales" fill="#8884d8" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="col-span-2 lg:col-span-1">
                            <CardHeader>
                                <CardTitle>Top Vehicles</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                {vehicleData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={vehicleData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {vehicleData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-muted-foreground">No data available</div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* LATEST NEWS */}
                    <div className="pt-6">
                        <h2 className="text-xl font-bold tracking-tight mb-4">Latest News & Updates</h2>
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
                                            <div 
                                                className="text-gray-600 whitespace-pre-wrap text-sm leading-relaxed prose prose-sm max-w-none"
                                                dangerouslySetInnerHTML={{ __html: article.description }}
                                            />
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
                    </div>
                </>
            )}
        </div>
    );
}
