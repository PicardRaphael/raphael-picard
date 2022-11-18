import createSchema from 'part:@sanity/base/schema-creator'

import schemaTypes from 'all:part:@sanity/base/schema-type'
import experience from './experience'
import project from './project'
import skill from './skill'
import social from './social'
import hero from './hero'
import footer from './footer'
import about from './about'
import cv from './cv'

export default createSchema({
  name: 'default',
  types: schemaTypes.concat([
    hero,
    footer,
    about,
    experience,
    project,
    skill,
    social,
    cv
  ]),
})
