import React from 'react';

import Tweet from './Tweet';

export default class TweetList extends React.Component {
	static propTypes = {
		tweets: React.PropTypes.array.isRequired,
	};

	render() {
		const list = this.props.tweets.map(tweet => (
			<li key={tweet.id} className="list-group-item">
				<div>Settings that removed this tweet: <b>{tweet.filters.join(', ')}</b></div>
				<Tweet tweet={tweet} />
			</li>
		));

		return (
			<ul className="list-group">
				{list}
			</ul>
		);
	}
}
