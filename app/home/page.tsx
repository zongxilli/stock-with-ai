// app/dashboard/page.tsx (Server Component)
import { getLatestMarketAnalysis } from '@/app/actions/marketAnalysis';

export default async function HomePage() {
	const latestAnalysis = await getLatestMarketAnalysis();

	return (
		<div className='p-6'>
			<h1 className='text-2xl font-bold mb-4'>市场分析仪表盘</h1>
			{latestAnalysis ? (
				<pre>{JSON.stringify(latestAnalysis, null, 2)}</pre>
			) : (
				<p>暂无市场分析数据</p>
			)}
		</div>
	);
}
