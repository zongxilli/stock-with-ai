/**
 * 工具函数集合，用于处理JSON相关操作
 */

/**
 * 清除内容中的JSON代码块标记
 * 去除```json和```标记，使其能正确解析为JSON
 *
 * @param content 需要处理的内容字符串
 * @param aggressiveCleaning 是否启用激进清理
 * @returns 已清除代码块标记的内容
 */
export function cleanJsonCodeBlockMarkers(
	content: string,
	aggressiveCleaning: boolean = false
): string {
	if (!content) return content;

	let cleanedContent = content;

	// 使用更通用的正则表达式处理```json开头标记（忽略大小写），无论后面是否有空格或直接跟着{
	cleanedContent = cleanedContent.replace(/```json\s*/gi, '');

	// 处理可能是```后面直接跟着内容的情况
	cleanedContent = cleanedContent.replace(/```(\s*\{)/g, '$1');

	// 去除剩余的```标记
	cleanedContent = cleanedContent.replace(/```/g, '');

	// 处理开头是"json"的情况（比如：json{ 或 json 后跟内容）
	cleanedContent = cleanedContent.replace(/^\s*json(?=\s*[\{\[])/i, '');

	// 如果启用激进清理，或者开头四个字母恰好是"json"，直接去掉
	if (aggressiveCleaning || /^\s*json\b/i.test(cleanedContent)) {
		cleanedContent = cleanedContent.replace(/^\s*json\b\s*/i, '');
	}

	return cleanedContent;
}
