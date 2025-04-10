/**
 * localStorage 工具类
 * 提供对 localStorage 的安全访问方法，包括类型支持
 */

/**
 * 检查 localStorage 是否可用
 * @returns {boolean} localStorage 是否可用
 */
const isLocalStorageAvailable = (): boolean => {
	try {
		const testKey = '__localStorage_test__';
		window.localStorage.setItem(testKey, testKey);
		window.localStorage.removeItem(testKey);
		return true;
	} catch (e) {
		return false;
	}
};

/**
 * 从 localStorage 获取值并转换为指定类型
 * @param key - 存储键名
 * @param defaultValue - 默认值，当值不存在或解析失败时返回
 * @returns 存储的值或默认值
 */
function getItem<T>(key: string, defaultValue: T): T {
	if (!isLocalStorageAvailable()) {
		console.warn('localStorage 不可用，返回默认值');
		return defaultValue;
	}

	try {
		const item = window.localStorage.getItem(key);

		// 键不存在时返回默认值
		if (item === null) {
			return defaultValue;
		}

		// 尝试解析 JSON
		return JSON.parse(item) as T;
	} catch (error) {
		console.error(`从 localStorage 获取 ${key} 失败:`, error);
		return defaultValue;
	}
}

/**
 * 将值存储到 localStorage
 * @param key - 存储键名
 * @param value - 要存储的值
 * @returns {boolean} 是否成功存储
 */
function setItem<T>(key: string, value: T): boolean {
	if (!isLocalStorageAvailable()) {
		console.warn('localStorage 不可用，无法存储');
		return false;
	}

	try {
		window.localStorage.setItem(key, JSON.stringify(value));
		return true;
	} catch (error) {
		console.error(`存储 ${key} 到 localStorage 失败:`, error);
		return false;
	}
}

/**
 * 从 localStorage 中删除指定键
 * @param key - 要删除的键名
 * @returns {boolean} 是否成功删除
 */
function removeItem(key: string): boolean {
	if (!isLocalStorageAvailable()) {
		console.warn('localStorage 不可用，无法删除');
		return false;
	}

	try {
		window.localStorage.removeItem(key);
		return true;
	} catch (error) {
		console.error(`从 localStorage 删除 ${key} 失败:`, error);
		return false;
	}
}

/**
 * 清空 localStorage 中的所有数据
 * @returns {boolean} 是否成功清空
 */
function clearAll(): boolean {
	if (!isLocalStorageAvailable()) {
		console.warn('localStorage 不可用，无法清空');
		return false;
	}

	try {
		window.localStorage.clear();
		return true;
	} catch (error) {
		console.error('清空 localStorage 失败:', error);
		return false;
	}
}

export const LocalStorageUtils = {
	getItem,
	setItem,
	removeItem,
	clearAll,
};
