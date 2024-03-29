import {useState, BaseSyntheticEvent} from 'react';
import {memo} from 'react';
import {AxiosInstance} from 'axios';
import {CommentType} from '../../types/comment-type';
import {APIRoute, ErrorMessage} from '../../const';
import {updateComments} from '../../store/action';
import {useDispatch} from 'react-redux';
import {useRef} from 'react';
import {useEffect} from 'react';
import {toast} from 'react-toastify';
import {useParams, useHistory} from 'react-router-dom';
import RatingStar from '../rating-star/rating-star';

type ReviewFormProps = {
  api: AxiosInstance
}

enum ReviewLength {
  Max = 400,
  Min = 50,
}

function getRatingStars(isDisabled: boolean): JSX.Element[] {
  const stars = [];

  for (let i = 10; i>0; i--) {
    stars.push(
      <RatingStar
        isDisabled = {isDisabled}
        number = {i}
        key={`${i}-star`}
      />);
  }
  return stars;
}

function ReviewForm({api}: ReviewFormProps): JSX.Element {

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isDisabled, setIsDisabled] = useState(false);

  const history = useHistory();

  const {id} = useParams<{id: string}>();

  const currentId = +id;

  const commentTextRef = useRef<HTMLTextAreaElement | null>(null);
  const submitButtonRef = useRef<HTMLButtonElement | null>(null);

  const dispatch = useDispatch();

  const addComment = async (filmId: number): Promise<void> => {
    try {
      const {data} = await api.post<CommentType[]>(`${APIRoute.Comments}/${filmId}`, {rating, comment});
      dispatch(updateComments(data));
      history.goBack();
    } catch {
      setIsDisabled(false);
      toast.info(ErrorMessage.SendCommentFail);
    }
  };

  useEffect(() => {
    if(commentTextRef.current !== null && submitButtonRef.current !== null) {
      if (
        commentTextRef.current.value.length < ReviewLength.Min ||
        commentTextRef.current?.value.length > ReviewLength.Max ||
        rating === 0) {
        submitButtonRef.current.disabled = true;
      } else {
        submitButtonRef.current.disabled = false;
      }
    }
  }, [commentTextRef.current?.value.length, rating]);

  return (
    <div className="add-review">
      <form
        className="add-review__form"
        onSubmit={(evt) => {
          evt.preventDefault();
          setIsDisabled(true);
          addComment(currentId);
        }}
      >
        <div className="rating">
          <div
            className="rating__stars"
            onClick={({target}: BaseSyntheticEvent) => {
              setRating(Number(target.value));}}
          >
            {getRatingStars(isDisabled)}
          </div>
        </div>

        <div className="add-review__text">
          <textarea
            ref={commentTextRef}
            disabled = {isDisabled}
            className="add-review__textarea"
            name="review-text"
            id="review-text"
            placeholder="Review text"
            minLength={ReviewLength.Min}
            maxLength={ReviewLength.Max}
            onInput={({target}: BaseSyntheticEvent) => {
              setComment(target.value);
            }}
          >
          </textarea>
          <div className="add-review__submit">
            <button
              ref={submitButtonRef}
              disabled = {isDisabled}
              className="add-review__btn"
              type="submit"
            >
              Post
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default memo(ReviewForm);

