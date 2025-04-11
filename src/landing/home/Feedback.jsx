import { useState, useRef, useEffect} from 'react'
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

const reviews = [
  {
    id: 1,
    name: 'Alicia R. – Owner of FitLife Gear',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    text: 'Ecom Logistics is a game-changer for our Amazon business. Their prep service is fast and efficient, and their customer service is exceptional. They answered all our questions promptly and ensured that everything was compliant with Amazon’s requirements. We couldn’t be happier!',
    stars: 5,
    service: 'Prep Center & FBA Shipments',
  },
  {
    id: 2,
    name: ' Mark T. – Amazon Reseller',
    image: 'https://randomuser.me/api/portraits/women/47.jpg',
    text: 'The LTL shipping service from Ecom Logistics is a lifesaver! Not only do they offer timely and reliable delivery, but they also offer residential pickup, which saves us a ton of time. Their customer service team is always friendly and incredibly helpful. We highly recommend them!',
    stars: 5,
    service: 'LTL Shipping & Residential Pickup',
  },
  {
    id: 3,
    name: 'Sophie L. – Private Label Owner',
    image: 'https://randomuser.me/api/portraits/men/45.jpg',
    text: 'Ecom Logistics has been a breath of fresh air. Their prep center service is lightning fast, and they make sure everything is perfect before shipping out. They offer the personal touch that many other companies lack. Honestly, it’s hard to find a logistics provider like this in Northern California. Highly recommend!',
    stars: 5,
    service: 'Prep Center',
  },
  {
    id: 4,
    name: 'Samuel W. – Operations Director at ForFit Sports',
    image: 'https://randomuser.me/api/portraits/women/35.jpg',
    text: 'I’ve been using Ecom Logistics for all our LTL shipments, and I couldn’t be more satisfied. Their services are fast, reliable, and hassle-free. The best part is that they handle everything from pick-up to delivery, and they make sure everything is handled with precision. We’ve saved time and money working with them.',
    stars: 5,
    service: 'LTL Shipping',
  },
  {
    id: 5,
    name: 'Angel Perez - Amazon Reseller',
    image: 'https://randomuser.me/api/portraits/men/33.jpg',
    text: "I've been an Amazon seller for 5 years, and working with Diego from Ecom Logistics has been a game-changer. From the personalized advice they provide to how fast and efficient they are, it's been a tremendous experience. If you're just starting in this business, my recommendation is to use a prep center like theirs and focus on the crucial aspects like securing capital and products",
    stars: 5,
    service: 'LTL Shipping & Residential Pickup',
  },
]


export default function CustomerFeedback() {
  const containerRef = useRef(null)
  const [canScrollNext, setCanScrollNext] = useState(true)
  const [canScrollPrev, setCanScrollPrev] = useState(false)

  const cardWidth = 350 + 2

  const checkScrollPosition = () => {
    const container = containerRef.current
    if (!container) return

    const scrollLeft = container.scrollLeft
    const maxScrollLeft = container.scrollWidth - container.clientWidth

    setCanScrollPrev(scrollLeft > 0)
    setCanScrollNext(scrollLeft < maxScrollLeft - 1) 
  }

  const scrollBy = (direction) => {
    const container = containerRef.current
    if (!container) return
    const scrollAmount = direction === 'next' ? cardWidth : -cardWidth

    container.scrollBy({
      left: scrollAmount,
      behavior: 'smooth',
    })
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      checkScrollPosition()
    }

    checkScrollPosition()
    container.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', checkScrollPosition)

    return () => {
      container.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', checkScrollPosition)
    }
  }, [])

  return (
    <section className="bg-white py-16">
      <div className="max-w-[1350px] mx-auto px-4 sm:px-8 md:px-16">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
          <div className="w-full lg:w-2/3">
            <h1 className="text-4xl md:text-5xl font-medium mb-2 text-blue">
              Customer Feedback:
            </h1>
            <h1 className="tracking-tight font-normal text-primary text-4xl lg:text-5xl">
              The Proof of Our
            </h1>
            <h1 className="tracking-tight font-normal text-primary text-4xl lg:text-5xl">
              Moving Excellence
            </h1>
          </div>
          <div className="flex flex-col items-end text-right">
            <p className="text-gray-500 text-sm">Total Reviews</p>
            <p className="text-4xl font-bold text-third">122 K</p>
            <span className="text-sm bg-third text-white px-3 py-1 rounded-full mt-1 mb-1 inline-flex items-center gap-1">
              24% <span role="img" aria-label="Search">🔍</span>
            </span>
            <p className="text-xs text-gray-500">Searching for excellence</p>
          </div>
        </div>

        {/* Carousel */}
        <div className="mt-12 relative">
          <div
            ref={containerRef}
            className="flex overflow-hidden gap-2 scroll-smooth"
            style={{ scrollBehavior: 'smooth' }}
          >
            {reviews.map((review) => (
              <div
                key={review.id}
                className="min-w-[350px] bg-[#F4F4F4] rounded-xl p-6 shadow-sm flex flex-col justify-between"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={review.image}
                      alt={review.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex flex-col">
                      <p className="text-sm font-semibold text-third">{review.name}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex text-third text-sm mb-2">
                    {'★'.repeat(review.stars)}
                  </div>
                  <p className="text-sm text-gray-700">{review.text}</p>
                </div>
                <hr className="my-4 border-gray-200" />
                <div>
                  <p className="text-xs text-gray-500">{review.service}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="mt-10 flex justify-end gap-4">
            <button
              onClick={() => scrollBy('prev')}
              disabled={!canScrollPrev}
              className="w-10 h-10 flex items-center justify-center border border-blue rounded-full hover:bg-white disabled:opacity-30"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={() => scrollBy('next')}
              disabled={!canScrollNext}
              className="w-10 h-10 flex items-center justify-center bg-blue text-white rounded-full hover:bg-blue-600 disabled:opacity-30"
            >
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}