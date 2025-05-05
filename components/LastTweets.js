import styles from "../styles/LastTweets.module.css";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { refreshTweets } from "../reducers/tweets";
import moment from 'moment';

function LastTweets() {
  const dispatch = useDispatch();
  const [tweets, setTweets] = useState([]);

  const user = useSelector((state) => state.user.value);
  const refresh = useSelector((state) => state.tweets.needsRefresh);

  const fetchTweets = () => {
    fetch("http://localhost:3000/tweets")
      .then((response) => response.json())
      .then((data) => {
        if (data.result) {
          setTweets(data.tweets);
        }
      });
  };

  useEffect(() => {
    fetchTweets();
  }, [refresh]);

  const handleDeleteTweet = (tweetId) => {
    fetch(`http://localhost:3000/tweets/deletetweet/${tweetId}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then(() => {
        dispatch(refreshTweets());
      });
  };

  const handleLike = (tweetId) => {
    fetch(`http://localhost:3000/tweets/likes/${tweetId}`, {
      method: 'PUT',
      headers: { 'Content-Type' : 'application/json' },
      body: JSON.stringify({
        token: user.token
      })
    })
    .then(response => response.json())
    .then(() => {
      dispatch(refreshTweets());
    })
  }

  const tweetsList = tweets.map((data, index) => {
    console.log(data.likes)
    const style = {color: '#E60071'}

    return (
      <div className={styles.tweet} key={index}>
        <div className={styles.userInfo}>
          <Image
            className={styles.pfp}
            src="/twitter-pfp.avif"
            alt="Profile picture"
            width={40}
            height={40}
          />
          <span className={styles.firstname}>{data.author.firstname} </span>
          <span className={styles.username}>@{data.author.username} </span>
          <span className={styles.date}>• {moment(data.date).fromNow()}</span>
        </div>
        <div className={styles.text}>
          {data.text.split(/(\s+)/).map((word, i) => {
            if (word.match(/^#\w+/)) {
              return (
                <span key={i} style={{ color: '#267CDD', fontWeight: 'bold', cursor: 'pointer' }}>
                  {word}
                </span>
              ); 
            }
            return word;
          })}</div>
        <div className={styles.icons}>
          <span className={styles.heartIcon} style={data.likes.find(users => users.token === user.token) ? style : {}}>
            <FontAwesomeIcon icon={faHeart} onClick={() => handleLike(data._id)}/> {data.likes.length}
          </span>
          {data.author.token === user.token ? (
            <FontAwesomeIcon
              icon={faTrashCan}
              className={styles.trashcanIcon}
              onClick={() => handleDeleteTweet(data._id)}
            />
          ) : (
            <></>
          )}
        </div>
      </div>
    );
  });
  tweetsList.sort((a, b) => (a.date > b.date ? 1 : -1));

  return <div className={styles.tweetsContainer}>{tweetsList}</div>;
}

export default LastTweets;
