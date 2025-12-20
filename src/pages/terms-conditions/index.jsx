import React from 'react'
import { withTranslation } from 'react-i18next'
import Meta from 'src/components/SEO/Meta'
import TermsAndConditions from 'src/components/Static-Pages/TermsAndConditions'

const TermAndConditions = ({ t }) => {

  return (
    <>
      <Meta />
      <TermsAndConditions />
    </>
  )
}
export default withTranslation()(TermAndConditions)
