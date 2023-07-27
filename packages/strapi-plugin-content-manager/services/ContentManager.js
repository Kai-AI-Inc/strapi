'use strict';

const _ = require('lodash');

function getServiceMethod(model, method) {
  if (
    strapi.entityServiceOverrides &&
    strapi.entityServiceOverrides[model] &&
    strapi.entityServiceOverrides[model][method]
  ) {
    return strapi.entityServiceOverrides[model][method];
  }

  return strapi.entityService[method];
}

/**
 * A set of functions called "actions" for `ContentManager`
 */
module.exports = {
  fetchAll(model, query) {
    const { query: request, populate, ...filters } = query;

    const queryFilter = !_.isEmpty(request)
      ? {
          ...filters, // Filters is an object containing the limit/sort and start
          ...request,
        }
      : filters;

    return getServiceMethod(model, 'find')(
      {
        params: queryFilter,
        populate,
      },
      { model }
    );
  },

  fetch(model, id, config = {}) {
    const { query = {}, populate } = config;

    return getServiceMethod(model, 'findOne')(
      {
        params: { ...query, id },
        populate,
      },
      { model }
    );
  },

  count(model, query) {
    return getServiceMethod(model, 'count')({ params: query }, { model });
  },

  create({ data, files }, { model } = {}) {
    return getServiceMethod(model, 'create')({ data, files }, { model });
  },

  edit(params, { data, files }, { model } = {}) {
    return getServiceMethod(model, 'update')({ params, data, files }, { model });
  },

  delete(model, query) {
    return getServiceMethod(model, 'delete')({ params: query }, { model });
  },

  deleteMany(model, ids, query) {
    const { primaryKey } = strapi.query(model);

    return getServiceMethod(model, 'delete')(
      {
        params: {
          _limit: 100,
          ...query,
          _where: _.concat({ [`${primaryKey}_in`]: ids }, query._where || {}),
        },
      },
      { model }
    );
  },

  search(model, query, params) {
    return getServiceMethod(model, 'search')({ params: { ...query, ...params } }, { model });
  },

  countSearch(model, query) {
    return getServiceMethod(model, 'countSearch')({ params: query }, { model });
  },
};
