import React from 'react'
import { withTranslation } from 'react-i18next'
import Meta from 'src/components/SEO/Meta'
import PrivacyPolicyComp from 'src/components/Static-Pages/PrivacyPolicy'

const PrivacyPolicy = ({ t }) => {

  return (
    <>
      <Meta />
      <PrivacyPolicyComp />
    </>
  )
}
export default withTranslation()(PrivacyPolicy)
