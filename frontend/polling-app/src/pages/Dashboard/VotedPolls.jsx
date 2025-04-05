import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import useUserAuth from "../../hooks/useUserAuth";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import PollCard from "../../components/PollCards/PollCard";

import CREATE_ICON from "../../assets/images/my-poll-icon.png";
import EmptyCard from "../../components/cards/EmptyCard";


const VotedPolls = () => {
  useUserAuth();

  const navigate = useNavigate();

  const [votedPolls, setVotedPolls] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAllPolls = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const response = await axiosInstance.get(API_PATHS.POLLS.VOTED_POLLS);

      if (response.data?.polls?.length > 0) {
        setVotedPolls((prevPolls) => [...prevPolls, ...response.data.polls]);
      }
    } catch (error) {
      console.log("Something went wrong. Please try again.", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPolls();
    return () => {};
  }, []);

  return (
    <DashboardLayout activeMenu="Voted Polls">
      <div className="my-5 mx-auto">
        <h2 className="text-xl font-medium text-black">Voted Polls</h2>

        {votedPolls.length === 0 && !loading && (
          <EmptyCard
            imgSrc={CREATE_ICON}
            message="You have not voted on any polls yet! Start exploring and share your opinion by voting on polls now!"
            btnText="Explore"
            onClick={() => navigate("/dashboard")}
          />
        )}

        {votedPolls.map((poll) => (
          <PollCard
            key={`dashboard_${poll._id}`}
            pollId={poll._id}
            question={poll.question}
            type={poll.type}
            options={poll.options}
            voters={poll.voters.length || 0}
            responses={poll.responses || []}
            creatorProfileImg={poll.creator.profileImageUrl || null}
            creatorName={poll.creator.fullName}
            creatorUsername={poll.creator.username}
            userHasVoted={poll.userHasVoted || false}
            isPollClosed={poll.closed || false}
            createdAt={poll.createdAt || false}
          />
        ))}
      </div>
    </DashboardLayout>
  );
};

export default VotedPolls;
