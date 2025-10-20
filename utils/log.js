// 保存文字
let logTextData = '';

/**
 * js 日期格式化
 * 传时间戳参数进行时间戳转换，不传时返回当前时间（返回年月日时分秒格式）
 * @param {Object} timeStamp 时间戳参数 非必传
 * @param {Object} format 格式化样式 非必传
 */
function getTimeStampDatetime(format = 'yyyy-MM-dd HH:mm:ss', timeStamp) {
	let nowDatetime = new Date()
	timeStamp ? nowDatetime = new Date(timeStamp) : nowDatetime = new Date()
	return nowDatetime.Format(format)
}
Date.prototype.Format = function(fmt) {
	var o = {
		"M+": this.getMonth() + 1, //月份 
		"d+": this.getDate(), //日 
		"H+": this.getHours(), //小时 
		"m+": this.getMinutes(), //分 
		"s+": this.getSeconds(), //秒 
		"q+": Math.floor((this.getMonth() + 3) / 3), //季度 
		"S": this.getMilliseconds() //毫秒 
	};
	if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	for (var k in o)
		if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : ((
			"00" + o[
				k]).substr(("" + o[k]).length)));
	return fmt;
}

export default {}