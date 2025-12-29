"use client"
import React from 'react'
import { withTranslation } from 'react-i18next'
import Breadcrumb from 'src/components/Common/Breadcrumb'
import dynamic from 'next/dynamic'
import Image from 'next/image'

const Layout = dynamic(() => import('../Layout/Layout'), { ssr: false })

const NgoCharity = ({ t }) => {

    const scrollToCampaigns = () => {
        const element = document.getElementById('donation-campaigns');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Mock data for US Donation Campaigns
    const usCampaigns = [
        {
            id: 1,
            title: "IMO Charity",
            description: "Empowering young people to take control of their lives and future.",
            target: "£50,000",
            raised: "£12,500",
            link: "https://www.impetus.org.uk/portfolio-partners/imo-charity?gad_source=1&gad_campaignid=22609491245&gbraid=0AAAAADmSRPWKGbsS6E_ikXH4Wlr08KBfW&gclid=CjwKCAiA9aPKBhBhEiwAyz82J1Vx3eCjkSyNL50euxHTc-CwetuLxWb1U8_67l5rxURtN-y-tlZCQhoCHkYQAvD_BwE"
        },
        {
            id: 2,
            title: "NAWO",
            description: "National Alliance of Women's Organisations - working for gender equality.",
            target: "£75,000",
            raised: "£45,000",
            link: "https://nawo.org.uk/"
        },
        {
            id: 3,
            title: "Upendo Kids",
            description: "Providing love, care, and education to orphaned and vulnerable children.",
            target: "£100,000",
            raised: "£30,000",
            link: "https://www.upendokids.org/?gad_source=1&gad_campaignid=21858623223&gbraid=0AAAAADEh7fy5hCSgBBi1JAV2rdzqIFuX7&gclid=CjwKCAiA9aPKBhBhEiwAyz82J2AB-jK4wWJSkJjBJAT43yVNEiytImPf5Z3Lbzy2dc7wJQDSv0CXyxoCtvkQAvD_BwE"
        },
        {
            id: 4,
            title: "British Red Cross",
            description: "Helping people in crisis, whoever and wherever they are.",
            target: "£200,000",
            raised: "£150,000",
            link: "https://www.redcross.org.uk/"
        },
        {
            id: 5,
            title: "British Heart Foundation",
            description: "Funding research to beat heartbreak specifically from heart and circulatory diseases.",
            target: "£500,000",
            raised: "£320,000",
            link: "https://www.bhf.org.uk/"
        }
    ]

    return (
        <Layout>
            <Breadcrumb title={t('ngo_charity')} content="" contentTwo="" />
            <div className='Instruction'>
                <div className='container'>
                    <div className='row morphisam p-4 align-items-center'>
                        <div className='col-lg-6 col-12 mb-4 mb-lg-0'>
                            <div className="charity-image-wrapper">
                                <Image
                                    src={require('src/assets/images/charity_hero.png')}
                                    alt="Charity"
                                    className="img-fluid rounded-4 shadow-lg hover-scale"
                                    style={{
                                        border: '4px solid rgba(255, 255, 255, 0.1)',
                                        transition: 'transform 0.3s ease'
                                    }}
                                />
                            </div>
                        </div>
                        <div className='col-lg-6 col-12'>
                            <div className="charity-content ps-lg-4">
                                <h1 className="mb-4 text-dark font-weight-bold" style={{ fontSize: '2.5rem' }}>
                                    {t('our_mission')}
                                </h1>
                                <p className="text-secondary mb-4 lead" style={{ opacity: 0.9 }}>
                                    {t('charity_mission_desc')}
                                </p>
                                <div className="text-secondary mb-5">
                                    <p className="mb-3">
                                        We are aimed at providing support to those in need.
                                        Our various programs include food distribution, educational support, and medical aid.
                                    </p>
                                    <p>
                                        Join us in making a difference today. Every contribution counts towards building a better future.
                                    </p>
                                </div>
                                <div className="">
                                    <button
                                        className="btn btn-primary btn-lg px-5 py-3 rounded-pill shadow-sm"
                                        onClick={scrollToCampaigns}
                                        style={{ fontSize: '1.2rem', fontWeight: '600' }}
                                    >
                                        {t('donate')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* US Donation Campaigns Section */}
                    <div id="donation-campaigns" className="row mt-5 pt-4">
                        <div className="col-12 mb-5 text-center">
                            <h2 className="text-dark display-5 fw-bold">Donation Campaigns</h2>
                            <p className="text-secondary">Choose a cause close to your heart</p>
                        </div>
                        {usCampaigns.map(campaign => (
                            <div key={campaign.id} className="col-lg-4 col-md-6 mb-4">
                                <div className="card h-100 bg-white border-0 text-dark shadow-sm hover-lift" style={{ transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}>
                                    {/* Premium Charity Card Header Image */}
                                    <div className="card-img-top position-relative" style={{ height: '240px', overflow: 'hidden' }}>
                                        <Image
                                            src={require('src/assets/images/charity_card_bg.png')}
                                            alt={campaign.title}
                                            layout="fill"
                                            objectFit="cover"
                                            className="transition-transform duration-500 hover:scale-110"
                                        />
                                        <div className="position-absolute w-100 h-100" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 100%)' }}></div>
                                    </div>
                                    <div className="card-body p-4 d-flex flex-column">
                                        <h4 className="card-title fw-bold mb-3">{campaign.title}</h4>
                                        <p className="card-text mb-4 text-secondary">{campaign.description}</p>
                                        <div className="mt-auto">
                                            <div className="d-flex justify-content-between mb-2">
                                                <small className="fw-bold">Raised: {campaign.raised}</small>
                                                <small className="text-secondary">Target: {campaign.target}</small>
                                            </div>
                                            <div className="progress mb-4" style={{ height: '8px', backgroundColor: '#e9ecef' }}>
                                                <div
                                                    className="progress-bar bg-primary"
                                                    role="progressbar"
                                                    style={{
                                                        width: `${(parseInt(campaign.raised.replace(/\D/g, '')) / parseInt(campaign.target.replace(/\D/g, ''))) * 100}%`
                                                    }}
                                                    aria-valuenow="25"
                                                    aria-valuemin="0"
                                                    aria-valuemax="100"
                                                ></div>
                                            </div>
                                            <button
                                                className="btn btn-outline-primary w-100 rounded-pill py-2 fw-semibold"
                                                onClick={() => window.open(campaign.link, '_blank')}
                                            >
                                                Donate Now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default withTranslation()(NgoCharity)
