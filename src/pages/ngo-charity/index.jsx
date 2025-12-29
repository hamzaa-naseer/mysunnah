import { withTranslation } from 'react-i18next'
import NgoCharity from 'src/components/Static-Pages/NgoCharity'
import Meta from 'src/components/SEO/Meta'

const NgoCharityPage = () => {
    return (
        <>
            <Meta title="NGO Charity" description="Support our charitable causes" />
            <NgoCharity />
        </>
    )
}

export default withTranslation()(NgoCharityPage)
