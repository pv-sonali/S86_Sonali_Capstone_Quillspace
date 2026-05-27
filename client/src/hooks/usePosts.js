import api from '../services/api'

export default function usePosts() {
  const getPosts = async (page = 1, limit = 10, filters = {}) => {
    const res = await api.get('/posts', { params: { page, limit, ...filters } })
    return res.data.data
  }

  const getPostBySlug = async (slug) => {
    const res = await api.get(`/posts/slug/${slug}`)
    return res.data.data.post
  }

  const getPostById = async (id) => {
    const res = await api.get(`/posts/${id}`)
    return res.data.data.post
  }

  const createPost = async (data) => {
    const res = await api.post('/posts', data)
    return res.data.data.post
  }

  const updatePost = async (id, data) => {
    const res = await api.put(`/posts/${id}`, data)
    return res.data.data.post
  }

  const deletePost = async (id) => {
    return await api.delete(`/posts/${id}`)
  }

  const toggleLike = async (id) => {
    const res = await api.put(`/posts/${id}/like`)
    return res.data.data
  }

  return { getPosts, getPostBySlug, getPostById, createPost, updatePost, deletePost, toggleLike }
}
