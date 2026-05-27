import api from '../services/api'

export default function useComments() {
  const getCommentsByPost = async (postId) => {
    const res = await api.get(`/comments/${postId}`)
    return res.data.data.comments
  }

  const createComment = async (data) => {
    const res = await api.post('/comments', data)
    return res.data.data.comment
  }

  const updateComment = async (id, data) => {
    const res = await api.put(`/comments/${id}`, data)
    return res.data.data.comment
  }

  const deleteComment = async (id) => {
    return await api.delete(`/comments/${id}`)
  }

  return { getCommentsByPost, createComment, updateComment, deleteComment }
}
