
const CommentBox = ({ comment }: { comment: any }) => {
    console.log(comment);
    return (
        <>
            <img src="https://www.redditstatic.com/avatars/defaults/v2/avatar_default_2.png" alt="User Avatar" className="h-12 w-12 rounded-full" />
            <div>{comment.username}</div>
            <div>{comment.comments}</div>
        </>
    );
};

export default CommentBox;