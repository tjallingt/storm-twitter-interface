import React from 'react';

function Panel({ title, children, childHasBody }) {
	let panelChildren = children;
	if (!childHasBody) {
		panelChildren = (
			<div className="panel-body">
				{children}
			</div>
		);
	}
	return (
		<div className="panel panel-default">
			<div className="panel-heading">
				<h1 className="panel-title">{title}</h1>
			</div>
			{panelChildren}
		</div>
	);
}

Panel.propTypes = {
	title: React.PropTypes.string,
	children: React.PropTypes.node,
	childHasBody: React.PropTypes.bool,
};

export default Panel;
