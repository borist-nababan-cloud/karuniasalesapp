import { parseSpkDataForPdf } from './spkLogic';

/**
 * Computes KPIs from an array of raw Supabase SPK records.
 * @param spks Raw array of SPKs from Supabase
 */
export const computeDashboardKPIs = (spks: any[]) => {
    if (!spks || spks.length === 0) {
        return {
            totalSpk: 0,
            totalRevenue: 0,
            pendingFollowUps: 0,
            cashRatio: 0,
            creditRatio: 0
        };
    }

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    let totalSpk = 0;
    let totalRevenue = 0;
    let pendingFollowUps = 0;
    let cashCount = 0;
    let creditCount = 0;

    spks.forEach(spk => {
        const parsed = parseSpkDataForPdf(spk);
        if (!parsed) return;

        const date = new Date(parsed.tanggal || parsed.createdAt);
        if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
            totalSpk++;
            
            if (parsed.finish) {
                totalRevenue += (parsed.unitInfo?.hargaOtr || 0);
            } else {
                pendingFollowUps++;
            }

            const via = parsed.paymentInfo?.pembelianVia?.toLowerCase() || '';
            if (via.includes('cash') || via.includes('tunai')) {
                cashCount++;
            } else if (via.includes('kredit') || via.includes('credit') || via.includes('leasing')) {
                creditCount++;
            }
        }
    });

    const totalMethods = cashCount + creditCount;
    const cashRatio = totalMethods > 0 ? Math.round((cashCount / totalMethods) * 100) : 0;
    const creditRatio = totalMethods > 0 ? Math.round((creditCount / totalMethods) * 100) : 0;

    return {
        totalSpk,
        totalRevenue,
        pendingFollowUps,
        cashRatio,
        creditRatio
    };
};

/**
 * Aggregates SPKs by day for the Sales Trend Chart.
 */
export const aggregateSalesTrend = (spks: any[]) => {
    const trendMap = new Map<string, number>();
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        trendMap.set(d.toISOString().split('T')[0], 0);
    }

    spks.forEach(spk => {
        const parsed = parseSpkDataForPdf(spk);
        if (!parsed) return;
        
        const dateStr = parsed.tanggal ? parsed.tanggal.split('T')[0] : (parsed.createdAt ? parsed.createdAt.split('T')[0] : null);
        if (dateStr && trendMap.has(dateStr)) {
            trendMap.set(dateStr, (trendMap.get(dateStr) || 0) + 1);
        }
    });

    return Array.from(trendMap.entries()).map(([date, count]) => ({
        date: date.substring(8, 10) + '/' + date.substring(5, 7), // DD/MM
        sales: count
    }));
};

/**
 * Aggregates Top Vehicle Types
 */
export const aggregateTopVehicles = (spks: any[]) => {
    const vehicleMap = new Map<string, number>();

    spks.forEach(spk => {
        const parsed = parseSpkDataForPdf(spk);
        if (!parsed) return;

        const vName = parsed.unitInfo?.vehicleType?.name || 'Unknown';
        vehicleMap.set(vName, (vehicleMap.get(vName) || 0) + 1);
    });

    return Array.from(vehicleMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); // Top 5
};

/**
 * Aggregates Leasing Distribution
 */
export const aggregateLeasingDistribution = (spks: any[]) => {
    const leasingMap = new Map<string, number>();

    spks.forEach(spk => {
        const parsed = parseSpkDataForPdf(spk);
        if (!parsed) return;

        const isCredit = parsed.paymentInfo?.pembelianVia?.toLowerCase().includes('kredit');
        if (isCredit) {
            const lName = parsed.paymentInfo?.namaLeasing || 'Unknown';
            leasingMap.set(lName, (leasingMap.get(lName) || 0) + 1);
        }
    });

    return Array.from(leasingMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
};
