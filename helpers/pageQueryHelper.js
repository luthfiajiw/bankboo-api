function pageQueryHelper(query) {
  const { page, per_page } = query;

  let _page = page === undefined ? 1 : parseInt(page, 10);
  let perPage = per_page === undefined ? 10 : parseInt(per_page, 10);

  return {
    page: _page,
    perPage
  };
}

module.exports = pageQueryHelper;
