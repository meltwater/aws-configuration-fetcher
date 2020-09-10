const configurationRequestTypes = {
  secret: 'secret',
  ssm: 'ssm'
}

export const ConfigurationRequestTypes = {
  ...configurationRequestTypes,
  isValid: (possibleType) => {
    return Object.values(configurationRequestTypes).includes(possibleType)
  }
}
