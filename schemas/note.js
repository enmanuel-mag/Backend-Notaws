module.exports.getSanitation = function() {
  return {
    type: 'object',
    properties: {
      authorId: {
        type: 'string',
        rules: ['trim'],
      },
    },
  }
}

module.exports.getValidation = function() {
  return {
    type: 'object',
    properties: {
      authorId: {
        type: 'string',
        rules: ['trim'],
        minLength: 1,
        gt: 0
      },
    },
  }
}


module.exports.createSanitation = function() {
  return {
    type: 'object',
    properties: {
      authorId: {
        type: 'string',
        rules: ['trim'],
      },
      title: {
        type: 'string',
        rules: ['trim'],
      },
      content: {
        type: 'string',
        rules: ['trim'],
      }
    },
  }
}

module.exports.createValidation = function() {
  return {
    type: 'object',
    properties: {
      authorId: {
        type: 'string',
        minLength: 1,
        gt: 0
      },
      title: {
        type: 'string',
        minLength: 1
      },
      content: {
        type: 'string',
        minLength: 1
      }
    },
  }
}


module.exports.deleteSanitation = function() {
  return {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        rules: ['trim'],
      },
    },
  }
}

module.exports.deleteValidation = function() {
  return {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        minLength: 1,
      },
    },
  }
}


module.exports.updateSanitation = function() {
  return {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        rules: ['trim'],
        optional: true
      },
      authorId: {
        type: 'string',
        rules: ['trim'],
        optional: true
      },
      title: {
        type: 'string',
        rules: ['trim'],
        optional: true
      },
      content: {
        type: 'string',
        rules: ['trim'],
        optional: true
      }
    },
  }
}

module.exports.updateValidation = function() {
  return {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        minLength: 1,
        optional: true
      },
      authorId: {
        type: 'string',
        minLength: 1,
        optional: true
      },
      title: {
        type: 'string',
        minLength: 1,
        optional: true
      },
      content: {
        type: 'string',
        minLength: 1,
        optional: true
      }
    },
  }
}