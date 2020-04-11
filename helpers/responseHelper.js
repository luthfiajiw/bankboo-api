function responseHelper(res, datas) {
	res.status(200).json({
		status_code: 200,
		message: 'successful',
		data: {
			count: datas.count === undefined ? 0 : datas.count,
			page_context: datas.page_context,
			// links: datas.links,
			results: datas.rows === undefined ? [] : datas.rows
		}
	});
}

module.exports = responseHelper;
