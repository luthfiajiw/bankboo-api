const { dev } = require('../config/url');

function paginationHelper(page, perPage, totalPage) {
  return {
    page_context : {
      page,
      perPage,
      totalPage
    },
    // links : {
    //   nextUrl: page === totalPage ? '' : `${dev}/provinces?page=${page+1}&per_page=${perPage}`,
    //   prevUrl: page === 1 ? '' : `${dev}/provinces?page=${page-1}&per_page=${perPage}`,
    //   first: `${dev}/provinces?page=1&per_page=${perPage}`,
    //   last: `${dev}/provinces?page=${totalPage}&per_page=${perPage}`
    // }
  };
}

module.exports = paginationHelper;
