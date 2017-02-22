import React from 'react';

function getTweetDisplayRange(tweet) {
	return tweet.truncated ? tweet.extended_tweet.displayTextRange : tweet.displayTextRange;
}

function getTweetEntities(tweet) {
	return tweet.truncated ? tweet.extended_tweet.entities : tweet.entities;
}

function getTweetText(tweet) {
	return tweet.truncated ? tweet.extended_tweet.full_text : tweet.text;
}

const styles = {
	tweet: {
		margin: 10,
	},
	retweet: {
		padding: 10,
		marginTop: 5,
		border: '1px solid #ddd',
		borderRadius: 4,
	},
	title: {
		margin: 0,
		fontWeight: 600,
	},
};

function getTweetDisplayText(tweet) {
	let text = getTweetText(tweet);
	const entities = getTweetEntities(tweet);
	const displayTextRange = getTweetDisplayRange(tweet);
	// remove excess text from the string
	if (displayTextRange) {
		text = text.slice(...displayTextRange);
	}
	// replace t.co urls with their 'readable' version
	entities.urls.forEach((entity) => {
		if (!entity.url) return;
		text = text.replace(entity.url, entity.display_url);
	});
	// remove media urls from the text
	if (entities.media) {
		entities.media.forEach((entity) => {
			text = text.replace(entity.url, '');
		});
	}
	// replace html entities (TODO: check if &lt; <  or &gt; > are required)
	text = text.replace(/&amp;/g, '&');
	return text;
}

function Tweet({ tweet, retweet }) {
	if (tweet.retweeted_status) {
		return (
			<div style={styles.tweet}>
				<p style={styles.title}>@{tweet.user.screen_name} retweeted</p>
				<Tweet tweet={tweet.retweeted_status} retweet />
			</div>
		);
	}
	const text = getTweetDisplayText(tweet);
	// const media = getTweetEntities(tweet).media;
	return (
		<div style={retweet ? styles.retweet : styles.tweet}>
			<p style={styles.title}>@{tweet.user.screen_name} tweeted</p>
			{text}
		</div>
	);
}

Tweet.propTypes = {
	tweet: React.PropTypes.object.isRequired,
	retweet: React.PropTypes.bool,
};

export default Tweet;
