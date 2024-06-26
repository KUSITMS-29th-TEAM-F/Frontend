import clsx from 'clsx';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import axios from '../../../../api/axios';

interface CommentTabProps {
  scholarshipId: number;
}

const CommentsTab = ({ scholarshipId }: CommentTabProps) => {
  const queryClient = useQueryClient();

  const [isCommentInputFocus, setIsCommentInputFocus] = useState(false);
  const [commentValue, setCommentValue] = useState('');
  const [commentList, setCommentList] = useState<
    {
      nickname: string;
      hours: string;
      comment: string;
    }[]
  >([]);

  useQuery({
    queryKey: ['announcements', scholarshipId, 'comments'],
    queryFn: async () => {
      const res = await axios.get(`/announcements/${scholarshipId}/comments`);
      setCommentList(res.data.data);
      return res.data;
    },
  });

  const addComment = useMutation({
    mutationFn: async (content: string) => {
      return await axios.post(`/announcements/${scholarshipId}/comments`, {
        commentContents: content,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['announcements'] });
      setCommentValue('');
      setIsCommentInputFocus(false);
    },
  });

  const handleCommentInputFocus = () => {
    setIsCommentInputFocus(true);
  };

  const handleCommentInputBlur = () => {
    setIsCommentInputFocus(false);
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCommentValue(e.target.value);
  };

  const handleCommentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addComment.mutate(commentValue);
  };

  return (
    <div>
      <form className="flex flex-col gap-2 p-4" onSubmit={handleCommentSubmit}>
        <div>
          <input
            type="text"
            placeholder="댓글 달기..."
            className={clsx(
              'text-sm-200 w-full border-b-2 pb-2 outline-none duration-150 placeholder:text-gray-30',
              {
                'border-gray-10': !isCommentInputFocus,
                'border-primary': isCommentInputFocus,
              },
            )}
            value={commentValue}
            onChange={handleCommentChange}
            onFocus={handleCommentInputFocus}
          />
        </div>
        {isCommentInputFocus && (
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              className="text-sm-200 text-gray-40"
              onClick={handleCommentInputBlur}
            >
              취소
            </button>
            <button
              type="submit"
              className="text-sm-300 rounded-full bg-primary px-4 py-2 text-gray-00"
            >
              등록
            </button>
          </div>
        )}
      </form>
      <ul>
        {commentList.map((comment, index) => (
          <li key={index} className="flex items-start gap-2 p-4">
            <div className="relative h-[2rem] w-[2rem] overflow-hidden rounded-full">
              <img
                src="/images/placeholders/placeholder-profile.png"
                alt="프사 임시 이미지"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
              <div>
                <div className="flex items-center gap-1">
                  <span className="caption-300 text-gray-90">
                    {comment.nickname}
                  </span>
                  <span className="caption-200 text-gray-40">
                    {comment.hours}
                  </span>
                </div>
                <p className="text-sm-extra text-gray-70">{comment.comment}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommentsTab;
