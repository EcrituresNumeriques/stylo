const { logger } = require('../logger')

const isEquivalent = (a, b) => {
  // Create arrays of property names
  const aProps = Object.getOwnPropertyNames(a);
  const bProps = Object.getOwnPropertyNames(b);

  // If number of properties is different,
  // objects are not equivalent
  if (aProps.length != bProps.length) {
    logger.debug('different length')
    return false;
  }

  for (let i = 0; i < aProps.length; i++) {
    let propName = aProps[i];

    // If values of same property are not equal,
    // objects are not equivalent
    if (JSON.stringify(a[propName]) !== JSON.stringify(b[propName])) {
      logger.debug(propName + ' is different', JSON.stringify(a[propName]), JSON.stringify(b[propName]))
      return false;
    }
  }

  // If we made it this far, objects
  // are considered equivalent
  return true;
}

module.exports = isEquivalent;