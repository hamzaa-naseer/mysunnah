'use client'
import React from 'react'
import PropTypes from 'prop-types'
import Link from 'next/link'

const Breadcrumb = ({ showBreadcrumb, title, content, contentTwo, contentThree, contentFour, allgames }) => {


  return (
    <React.Fragment>
      {showBreadcrumb &&
        <div className='breadcrumb__wrapper'>
          <div className='row'>
            <div className='Breadcrumb container'>
              <div className='page-title'>
                <h1 className='title'>{title}</h1>
              </div>
              <div className='breadcrumb__inner'>
                <ul className='breadcrumb justify-content-center'>
                  <li className='parent__link'>
                    <Link href={'/'}>{content}</Link>
                  </li>
                  {allgames && <li className='current allgames'><Link href={'/quiz-play'}>{allgames}</Link></li>}
                  {contentTwo && <li className='current'>{contentTwo}</li>}
                  {contentThree && <li className='current'>{contentThree}</li>}
                  {contentFour && <li className='current'>{contentFour}</li>}
                </ul>
              </div>

            </div>
          </div>
        </div>
      }

    </React.Fragment >
  )
}

Breadcrumb.propTypes = {
  title: PropTypes.string,
  content: PropTypes.string,
  contentTwo: PropTypes.string,
  contentThree: PropTypes.string
}

export default Breadcrumb
