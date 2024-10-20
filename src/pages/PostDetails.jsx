import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import postDetailsStyle from "../Components/css/PostDetails.module.css";

function PostDetails() {
    const { id } = useParams();
    const [postData, setPostData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await fetch(`http://localhost:3005/post/${id}`);
                const data = await response.json();
                setPostData(data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching post:', err);
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (!postData) return <div>Post not found</div>;

    return (
        <div className={postDetailsStyle.postContainer}>
            <img src={postData.post.cover_image} alt={postData.post.title} className={postDetailsStyle.coverImage} />
            <h1>{postData.post.title}</h1>
            <p>{postData.post.description}</p>

            {postData.steps.map((step, index) => (
                <div key={step.step_id} className={postDetailsStyle.recipeStep}>
                    <h3>Step {step.step_number}</h3>
                    <p>{step.step_text}</p>
                    {postData.pictures[index] && (
                        <img
                            src={postData.pictures[index].pictures}
                            alt={`Step ${step.step_number} picture`}
                            className={postDetailsStyle.stepImage}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}

export default PostDetails;
