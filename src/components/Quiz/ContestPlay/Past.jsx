import React, { Fragment, useEffect, useState } from "react";
import { t } from "i18next";
import { withTranslation } from "react-i18next";
import Skeleton from 'react-loading-skeleton';
import errorimg from "src/assets/images/error.svg"
import { truncate } from "src/utils";
const Past = ({ data, LeaderBoard }) => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (loading) {
            setTimeout(() => {
                setLoading(false);
            }, 2000);
        }
    }, [loading]);

    return (
        <Fragment>
            <div className="row">
                {loading ? (
                    <div className="text-center">
                        <Skeleton count={5} />
                    </div>
                ) : (
                    <>
                        {data ? (
                            data?.map((pastData, index) => {
                                return (
                                    // <div className="col-xxl-3 col-xl-4 col-lg-4 col-md-6 col-sm-12 col-12" key={index}>
                                    <div className="col-xxl-4 col-xl-4 col-lg-4 col-md-6 col-sm-12 col-12" key={index}>
                                        <div className="card">
                                            <div className="card-image">
                                                <img src={pastData.image} alt="wrteam" />
                                            </div>
                                            <div className="card-details">
                                                <div className="card-title">
                                                    <h3>{truncate(pastData.name, 23)}</h3>
                                                    <p>{truncate(pastData.description, 27)}</p>
                                                </div>

                                                <div className="card-footer">
                                                    <div className="upper-footer">
                                                        <div className="card-entry-fees">
                                                            <p>{t("entry_fees")}</p>
                                                            <span>{pastData.entry} {t("coins")}</span>
                                                        </div>
                                                        <div className="card-ends-on">
                                                            <p>{t("ends_on")}</p>
                                                            <span>{pastData.end_date}</span>
                                                        </div>
                                                        <div className="card-players">
                                                            <p>{t("Players")}</p>
                                                            <span>{pastData.participants}</span>
                                                        </div>
                                                    </div>

                                                    <div className="bottom-footer" onClick={() => LeaderBoard(pastData.id)}>
                                                        {/* <div className="card-players">
                                                            <p>{t("players")}</p>
                                                            <span>{pastData.participants}</span>
                                                        </div> */}
                                                        <div className="card-btn-play">
                                                            <p className="btn btn-play" >
                                                                {t("leader_board")}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center mt-4 commonerror">
                                <img src={errorimg.src} title="wrteam" className="error_img" />
                                <p>{t("no_past_contest")}</p>
                            </div>

                        )}
                    </>
                )}
            </div>
        </Fragment>
    );
};

export default withTranslation()(Past);
