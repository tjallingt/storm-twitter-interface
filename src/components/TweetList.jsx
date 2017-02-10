import React from 'react';

import Tweet from './Tweet';

export default class TweetList extends React.Component {
	static propTypes = {
		style: React.PropTypes.object,
		tweets: React.PropTypes.array.isRequired,
	};

	render() {
		const list = this.props.tweets.map(tweet => (
			<div key={tweet.id}>
				<Tweet key={tweet.id} tweet={tweet} />
				<ul><li>{tweet.filters.join(', ')}</li></ul>
				<br />
			</div>
		));

		return (
			<ul style={this.props.style}>
				{list}
			</ul>
		);
	}
}
