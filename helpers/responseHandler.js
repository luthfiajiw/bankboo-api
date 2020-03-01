function responseHandler(res, datas) {
	res.status(200).json({
		statusCode: 200,
		message: 'successful',
		results: {
			count: datas.count,
			page_context: datas.page_context,
			links: datas.links,
			data: datas.rows
		}
	});
}

module.exports = responseHandler;
