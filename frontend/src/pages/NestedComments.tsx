import CommentBox from "../components/CommentBox";

const comments = [
    {
        username: "Indumathi",
        comments: "Hi",
        replies: [
            {
                username: "velan",
                comments: "Hello",
            }
        ]
    },
    {
        username: "Elon Musk",
        comments: "Hi",
        replies: [
            {
                username: "Mark Zuckerberg",
                comments: "Hello",
                replies: [
                    {
                        username: "Bill Gates",
                        comments: "Good morning",
                    }
                ]
            }
        ]
    }
]
const NestedComments = () => {
    return (
        <div>
            <h1>Nested Comments</h1>
            {comments && comments.map((comment, index) => {
                return <CommentBox key={index} comment={comment} />
            })}
        </div>
    );
};

export default NestedComments;
