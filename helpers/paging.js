const getPagination = (page, size) => {
    let limit = size ? size : 10;
    let offset = (page - 1) * (limit)

    if (!page) {
        offset = 0
    }

    if (!size) {
        limit = null
    }


    return { limit, offset };
};

const getPagingData = (datarows, page, limit) => {
    const { count: itemCount, rows: data } = datarows;
    const currentPage = page ? page : 0;
    const pageCount = Math.ceil(itemCount / limit);

    return { itemCount, data, pageCount, currentPage };
};

module.exports = {
    getPagination,
    getPagingData
}