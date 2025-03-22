import React, { useEffect, useState } from 'react';

import { cleanJsonCodeBlockMarkers } from '@/utils/json-utils';

interface RealtimeJsonViewerProps {
	data: string | Record<string, any> | any[];
	initiallyExpanded?: boolean;
	className?: string;
	showRawOnError?: boolean;
}

/**
 * 实时JSON查看器 - 设计用于持续显示流式JSON数据
 * 即使数据不完整也会尝试显示当前可用数据
 */
const RealtimeJsonViewer: React.FC<RealtimeJsonViewerProps> = ({
	data,
	initiallyExpanded = false,
	className = '',
	showRawOnError = true,
}) => {
	// 存储处理后的数据
	const [processedData, setProcessedData] = useState<any>(null);

	// 原始数据用于在解析失败时显示
	const [rawData, setRawData] = useState<string>('');

	// 解析状态 (success, partial, error)
	const [parseStatus, setParseStatus] = useState<
		'success' | 'partial' | 'error'
	>('success');

	// 错误信息
	const [errorMsg, setErrorMsg] = useState<string>('');

	// 显示原始数据
	const [showRaw, setShowRaw] = useState<boolean>(false);

	// 当数据变化时进行处理
	useEffect(() => {
		// 准备原始数据的字符串表示
		const stringData =
			typeof data === 'string' ? data : JSON.stringify(data, null, 2);

		setRawData(stringData);

		// 如果提供的不是字符串，或者是空字符串，直接使用
		if (typeof data !== 'string' || data.trim() === '') {
			setProcessedData(data);
			setParseStatus('success');
			return;
		}

		// 使用工具函数清除可能的代码块标记
		const cleanedData =
			typeof data === 'string' ? cleanJsonCodeBlockMarkers(data) : data;

		try {
			// 尝试正常解析
			const parsed = JSON.parse(cleanedData as string);
			setProcessedData(parsed);
			setParseStatus('success');
			setErrorMsg('');
		} catch (error) {
			// 解析失败，尝试修复和部分显示
			try {
				// 尝试使用最佳努力修复进行解析
				const partialData = extractPartialJson(cleanedData as string);
				if (partialData !== null) {
					setProcessedData(partialData);
					setParseStatus('partial');
					setErrorMsg(
						(error as Error).message || 'JSON parsing error'
					);
				} else {
					// 如果无法提取任何有效数据，设置为错误状态
					setProcessedData(null);
					setParseStatus('error');
					setErrorMsg(
						(error as Error).message || 'JSON parsing error'
					);
				}
			} catch (extractError) {
				// 如果提取也失败，设置为错误状态
				setProcessedData(null);
				setParseStatus('error');
				setErrorMsg((error as Error).message || 'JSON parsing error');
			}
		}
	}, [data]);

	// 切换显示原始数据
	const toggleRawView = () => setShowRaw(!showRaw);

	// 如果没有数据可显示
	if (!data) {
		return (
			<div className={`text-gray-400 ${className}`}>
				Waiting for data...
			</div>
		);
	}

	// 显示内容
	return (
		<div className={className}>
			{/* 状态指示器 */}
			{parseStatus !== 'success' && (
				<div
					className={`px-3 py-2 mb-2 text-sm rounded ${
						parseStatus === 'partial'
							? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
							: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
					}`}
				>
					{parseStatus === 'partial'
						? 'Displaying partial data (streaming)'
						: 'Unable to parse JSON data'}
					{' - '}
					<span className='italic'>{errorMsg}</span>
					{showRawOnError && (
						<button
							onClick={toggleRawView}
							className='ml-2 underline hover:no-underline focus:outline-none'
						>
							{showRaw ? 'Hide' : 'Show'} raw data
						</button>
					)}
				</div>
			)}

			{/* 原始数据视图 */}
			{showRaw && parseStatus !== 'success' && (
				<div className='mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 overflow-auto max-h-96'>
					<pre className='text-xs font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap'>
						{rawData}
					</pre>
				</div>
			)}

			{/* JSON树视图 */}
			{processedData !== null && (
				<div className='font-sans text-sm'>
					<JsonNode
						data={processedData}
						name={null}
						isRoot={true}
						initiallyExpanded={initiallyExpanded}
						level={0}
					/>
				</div>
			)}
		</div>
	);
};

/**
 * 尝试从不完整的JSON字符串中提取尽可能多的有效数据
 * 这个函数使用最佳努力方法提取部分JSON结构
 */
function extractPartialJson(json: string): any {
	// 如果输入为空，返回null
	if (!json || json.trim() === '') return null;

	const trimmedJson = json.trim();

	// 尝试修复和解析最常见的问题

	// 1. 尝试简单修复 - 添加缺失的右括号
	try {
		// 计算左右括号数量
		const leftBraces = (trimmedJson.match(/{/g) || []).length;
		const rightBraces = (trimmedJson.match(/}/g) || []).length;
		const leftBrackets = (trimmedJson.match(/\[/g) || []).length;
		const rightBrackets = (trimmedJson.match(/\]/g) || []).length;

		// 创建一个修复版本，添加缺失的括号
		let repairedJson = trimmedJson;

		// 移除末尾的逗号，如果有的话
		repairedJson = repairedJson.replace(/,\s*$/, '');

		// 添加缺失的右括号
		if (leftBraces > rightBraces) {
			repairedJson += '}'.repeat(leftBraces - rightBraces);
		}

		// 添加缺失的右方括号
		if (leftBrackets > rightBrackets) {
			repairedJson += ']'.repeat(leftBrackets - rightBrackets);
		}

		// 尝试解析修复后的JSON
		try {
			return JSON.parse(repairedJson);
		} catch (e) {
			// 如果仍然失败，继续尝试其他方法
		}
	} catch (e) {
		// 忽略修复过程中的错误
	}

	// 2. 尝试提取最外层对象的开始部分
	if (trimmedJson.startsWith('{')) {
		try {
			// 找到最后一个完整的属性
			const regex =
				/"[^"]*"\s*:\s*(?:"[^"]*"|null|true|false|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|\{[^{]*\}|\[[^\[]*\])(?=,|$)/g;
			const matches = Array.from(trimmedJson.matchAll(regex));

			if (matches.length > 0) {
				// 构建一个部分对象
				const partialObject: Record<string, any> = {};

				for (const match of matches) {
					try {
						// 从匹配中提取键和值
						const keyValuePair = match[0];
						const separatorIndex = keyValuePair.indexOf(':');

						if (separatorIndex !== -1) {
							const key = keyValuePair
								.substring(0, separatorIndex)
								.trim()
								.replace(/^"|"$/g, '');
							const valueStr = keyValuePair
								.substring(separatorIndex + 1)
								.trim();

							// 尝试解析值
							try {
								// 对于简单值，直接解析
								if (valueStr === 'null') {
									partialObject[key] = null;
								} else if (valueStr === 'true') {
									partialObject[key] = true;
								} else if (valueStr === 'false') {
									partialObject[key] = false;
								} else if (
									/^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(
										valueStr
									)
								) {
									partialObject[key] = Number(valueStr);
								} else if (
									valueStr.startsWith('"') &&
									valueStr.endsWith('"')
								) {
									partialObject[key] = valueStr.slice(1, -1);
								} else if (
									valueStr.startsWith('{') &&
									valueStr.endsWith('}')
								) {
									partialObject[key] = JSON.parse(valueStr);
								} else if (
									valueStr.startsWith('[') &&
									valueStr.endsWith(']')
								) {
									partialObject[key] = JSON.parse(valueStr);
								}
							} catch (valueError) {
								// 如果值解析失败，使用原始字符串
								partialObject[key] =
									`[Parse error: ${valueStr}]`;
							}
						}
					} catch (matchError) {
						// 忽略单个匹配的错误
					}
				}

				// 如果至少提取了一个属性，返回部分对象
				if (Object.keys(partialObject).length > 0) {
					return partialObject;
				}
			}
		} catch (e) {
			// 忽略提取过程中的错误
		}
	}

	// 3. 尝试提取最外层数组的开始部分
	if (trimmedJson.startsWith('[')) {
		try {
			// 寻找数组中完整的元素
			let openBracket = 0;
			let openBrace = 0;
			let inString = false;
			let escape = false;
			let elementStart = 1; // 跳过开始的 [
			let partialArray = [];

			for (let i = 1; i < trimmedJson.length; i++) {
				const char = trimmedJson[i];

				// 处理字符串
				if (char === '"' && !escape) {
					inString = !inString;
				} else if (char === '\\' && inString) {
					escape = !escape;
				} else {
					escape = false;
				}

				// 如果不在字符串中，跟踪括号
				if (!inString) {
					if (char === '[') openBracket++;
					else if (char === ']') openBracket--;
					else if (char === '{') openBrace++;
					else if (char === '}') openBrace--;

					// 元素结束（逗号或右方括号）
					if (
						(char === ',' || char === ']') &&
						openBracket === 0 &&
						openBrace === 0
					) {
						try {
							const element = trimmedJson
								.substring(elementStart, i)
								.trim();
							if (element) {
								partialArray.push(JSON.parse(element));
							}
							elementStart = i + 1; // 下一个元素的开始
						} catch (elementError) {
							// 忽略单个元素的错误
						}

						// 如果找到右方括号，解析完成
						if (char === ']') break;
					}
				}
			}

			// 如果提取了至少一个元素，返回部分数组
			if (partialArray.length > 0) {
				return partialArray;
			}
		} catch (e) {
			// 忽略数组提取过程中的错误
		}
	}

	// 4. 最后的尝试: 返回一个包含原始字符串的对象
	// 在返回原始数据前，再次尝试清除可能的代码块标记
	try {
		// 使用工具函数清除代码块标记，启用激进清理模式
		const cleanedJson = cleanJsonCodeBlockMarkers(trimmedJson, true);

		// 确保清除后的内容仍有意义
		if (cleanedJson.trim()) {
			// 最后一次尝试解析清除后的内容
			try {
				const parsed = JSON.parse(cleanedJson.trim());
				return parsed;
			} catch (e) {
				// 如果仍然失败，尝试创建一个更友好的对象结构而不是直接使用rawPartialData
				// 检查是否看起来像一个对象
				if (cleanedJson.startsWith('{') && cleanedJson.includes(':')) {
					try {
						// 创建一个空的根对象
						const result: Record<string, string> = {};
						// 提取可能的字段名，用作键
						const fieldMatch = cleanedJson.match(/"([^"]+)"\s*:/);
						if (fieldMatch && fieldMatch[1]) {
							// 使用第一个找到的字段名作为键
							const fieldName = fieldMatch[1];
							result[fieldName] = cleanedJson.trim();
							return result;
						}
					} catch (err) {
						// 忽略任何错误
					}
				}

				// 最后的回退：尝试创建一个看起来像正常JSON对象的结构
				// 使用"content"作为键名，这样UI上看起来更友好
				return { content: cleanedJson.trim() };
			}
		}
	} catch (e) {
		// 忽略任何错误，继续使用未清除的原始数据
	}

	return { rawPartialData: trimmedJson };
}

// JSON节点组件
interface JsonNodeProps {
	data: any;
	name: string | null;
	isRoot: boolean;
	initiallyExpanded: boolean;
	level: number;
}

const JsonNode: React.FC<JsonNodeProps> = ({
	data,
	name,
	isRoot,
	initiallyExpanded,
	level,
}) => {
	const [isExpanded, setIsExpanded] = useState(initiallyExpanded);

	// 安全地确定数据类型
	const type = Array.isArray(data) ? 'array' : typeof data;

	// 检查是否为可展开的节点
	const isExpandable =
		(type === 'object' || type === 'array') &&
		data !== null &&
		Object.keys(data).length > 0;

	// 切换展开状态
	const toggleExpanded = () => setIsExpanded(!isExpanded);

	// 渲染叶节点(非对象/数组或空对象/数组)
	if (!isExpandable) {
		return (
			<div className='flex items-start py-1'>
				{!isRoot && <div className='mr-2 opacity-70'>•</div>}
				<div className='flex-1'>
					{name !== null && (
						<span className='font-medium text-primary mr-2'>
							{name}:
						</span>
					)}
					<ValueDisplay value={data} type={type} />
				</div>
			</div>
		);
	}

	// 渲染可展开节点(对象和数组)
	return (
		<div className='flex flex-col py-1'>
			<div
				className='flex items-center cursor-pointer'
				onClick={toggleExpanded}
			>
				<div className='mr-1 text-muted-foreground'>
					{isExpanded ? (
						<svg
							width='16'
							height='16'
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'
						>
							<path d='M6 9l6 6 6-6' />
						</svg>
					) : (
						<svg
							width='16'
							height='16'
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'
						>
							<path d='M9 18l6-6-6-6' />
						</svg>
					)}
				</div>
				{!isRoot && <div className='mr-2 opacity-70'>•</div>}
				<div className='flex-1'>
					{name !== null && (
						<span className='font-medium text-primary mr-2'>
							{name}:
						</span>
					)}
					<span className='text-muted-foreground'>
						{type === 'array' ? 'Array' : 'Object'}
						<span className='ml-1'>
							({Object.keys(data).length} items)
						</span>
					</span>
				</div>
			</div>

			{isExpanded && (
				<div className='ml-6 border-l-2 border-muted pl-2 mt-1'>
					{Object.keys(data).map((key) => (
						<JsonNode
							key={key}
							data={data[key]}
							name={key}
							isRoot={false}
							initiallyExpanded={initiallyExpanded}
							level={level + 1}
						/>
					))}
				</div>
			)}
		</div>
	);
};

// 值显示组件
interface ValueDisplayProps {
	value: any;
	type: string;
}

const ValueDisplay: React.FC<ValueDisplayProps> = ({ value, type }) => {
	// 处理null值
	if (value === null)
		return <span className='text-rose-500 dark:text-rose-400'>null</span>;

	// 处理undefined值
	if (value === undefined)
		return <span className='text-gray-400'>undefined</span>;

	switch (type) {
		case 'string':
			return (
				<span className='text-emerald-600 dark:text-emerald-400'>
					"{value}"
				</span>
			);
		case 'number':
			return (
				<span className='text-amber-600 dark:text-amber-400'>
					{value}
				</span>
			);
		case 'boolean':
			return (
				<span className='text-blue-600 dark:text-blue-400'>
					{String(value)}
				</span>
			);
		case 'object':
			// 空对象或数组
			return (
				<span className='text-muted-foreground'>
					{Array.isArray(value) ? '[]' : '{}'}
				</span>
			);
		default:
			// 处理其他类型
			return <span>{String(value)}</span>;
	}
};

export default RealtimeJsonViewer;
