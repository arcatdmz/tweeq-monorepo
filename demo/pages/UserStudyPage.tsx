import {Heading} from './docs'
import {UserStudyDemos} from './ResearchDemos'

export function UserStudyPage() {
	return <div {...{'vp-content': ''}} className="user-study" data-testid="user-study-page">
		<Heading level={1} id="user-study">User Study</Heading>
		<p>The following user tests are used to evaluate the performance of UI components for creative professionals.</p>
		<p>※ 以下のユーザーテストは、UIコンポーネントのパフォーマンスを評価するために使用されます。</p>
		<UserStudyDemos />
		<div style={{height: '30vh'}} />
	</div>
}
