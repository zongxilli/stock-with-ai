export default function HomeLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className=' mx-auto px-4 sm:px-6 lg:px-8'>
			{/* 页面标题区域 */}

			{/* 内容区域 */}
			<div className='py-4'>{children}</div>
		</div>
	);
}
