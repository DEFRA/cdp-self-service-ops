import Joi from 'joi'

const envTestSuiteValidation = Joi.object({
  repositoryName: Joi.string()
    .pattern(/^[\w-]*$/)
    .pattern(/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]$/, {
      name: 'startAndEndWithCharacter'
    })
    .min(1)
    .max(32)
    .required()
    .messages({
      'string.empty': 'Enter repository name',
      'string.pattern.base': 'Letters and numbers with hyphen separators',
      'string.pattern.name': 'Start and end with a character',
      'string.min': '1 character or more',
      'string.max': '32 characters or less'
    }),
  teamId: Joi.string()
    .messages({
      'any.required': 'Choose owning team'
    })
    .required()
})

export { envTestSuiteValidation }
