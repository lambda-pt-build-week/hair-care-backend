const router = require('express').Router()
const jwt = require('jsonwebtoken')
const Stylists = require('../helpers/stylistsHelper')
const {
  authenticate,
  checkStylist,
  checkUser
} = require('../../auth/authenticate')

router.get('/', async (req, res) => {
  try {
    const stylists = await Stylists.getStylists()
    res.status(200).json(stylists)
  } catch (error) {
    res.status(500).json({ error })
  }
})
router.get('/:id', async (req, res) => {
  const { id } = req.params
  try {
    const stylist = await Stylists.getStylistById(id)
    stylist
      ? res.status(200).json(stylist)
      : res.status(404).json({ error: 'Stylist not found' })
  } catch (error) {
    res.status(500).json({ error })
  }
})
router.get('/change/:id', authenticate, async (req, res) => {
  const { id } = req.params
  try {
    let exists = await Stylists.getStylistById(id)
    if (exists) {
      const edit = await Stylists.editStylist(
        id,
        { stylist: !exists.stylist },
        req.decoded.id
      )
      exists = await Stylists.getFullStylistById(id)
      req.session.user = exists
      const token = generateToken(exists)

      edit && exists
        ? res.status(201).json({ ...exists, token })
        : res.status(500).json({
            error: 'You cannot edit another stylist!'
          })
    } else res.status(404).json({ error: 'Stylist not found' })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: JSON.stringify(error) })
  }
})

router.put('/:id', authenticate, checkStylist, async (req, res) => {
  const { body } = req
  const { id } = req.params
  if (body.stylist) delete body.stylist
  if (
    body &&
    (body.bio ||
      body.profile_picture ||
      body.stylist_name ||
      body.first_name ||
      body.last_name ||
      body.location ||
      body.phone_number)
  )
    try {
      const exists = await Stylists.getStylistById(id)
      if (exists) {
        const edit = await Stylists.editStylist(id, body, req.decoded.id)
        exists = await Stylists.getFullStylistById(id)
        req.session.user = exists
        const token = generateToken(exists)

        edit && exists
          ? res.status(201).json({ ...exists, token })
          : res.status(500).json({
              error: 'You cannot edit another stylist!'
            })
      } else res.status(404).json({ error: 'Stylist not found' })
    } catch (error) {
      res.status(500).json({ error: JSON.stringify(error) })
    }
  else res.status(500).json({ error: 'Please provide a change to make' })
})
router.delete('/:id', authenticate, checkStylist, async (req, res) => {
  const { body } = req
  const { id } = req.params
  try {
    const canDelete = await Stylists.getStylistById(id)
    if (canDelete) {
      const success = await Stylists.deleteStylist(
        id,
        body.description,
        req.decoded.id
      )
      success
        ? res.status(201).json(success)
        : res.status(500).json({
            error: 'You cannot delete another stylist!'
          })
    } else res.status(404).json({ error: 'Stylist not found' })
  } catch (error) {
    res.status(500).json({ error: JSON.stringify(error) })
  }
})

function generateToken(stylist) {
  const payload = stylist
  const options = {
    expiresIn: '1d'
  }
  return jwt.sign(payload, process.env.JWT_SECRET, options)
}

module.exports = router
