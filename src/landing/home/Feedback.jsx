import { useState, useRef, useEffect } from 'react'
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

const reviews = [
  {
    id: 1,
    name: 'Sarah Johnson',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    text: 'They handled my move with care and professionalism. I’m beyond satisfied with the service!',
    stars: 5,
  },
  {
    id: 2,
    name: 'Lisa Smith',
    image: 'https://randomuser.me/api/portraits/women/47.jpg',
    text: 'Excellent experience from start to finish. Punctual, efficient and polite.',
    stars: 5,
  },
  {
    id: 3,
    name: 'David Parker',
    image: 'https://randomuser.me/api/portraits/men/45.jpg',
    text: 'Very smooth move. They even helped me unpack! Highly recommended.',
    stars: 5,
  },
  {
    id: 4,
    name: 'Emily Davis',
    image: 'https://randomuser.me/api/portraits/women/35.jpg',
    text: 'Stress-free and efficient. Great team!',
    stars: 5,
  },
  {
    id: 5,
    name: 'James Lee',
    image: 'https://randomuser.me/api/portraits/men/33.jpg',
    text: 'Affordable, quick, and careful. What more could I ask for?',
    stars: 5,
  },
]

export default function CustomerFeedback() {
  const containerRef = useRef(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const cardWidth = 384 // px (~96 Tailwind units)

  const maxIndex = reviews.length - 3

  const scrollToIndex = (index) => {
    const container = containerRef.current
    if (container) {
      container.scrollTo({
        left: index * (cardWidth + 24), // 24px = gap-x-6
        behavior: 'smooth',
      })
    }
  }

  useEffect(() => {
    scrollToIndex(currentIndex)
  }, [currentIndex])

  const next = () => {
    if (currentIndex < maxIndex) setCurrentIndex(currentIndex + 1)
  }

  const prev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1)
  }

  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-16">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
          
          <div className="w-full lg:w-2/3">
            <h1 className="text-4xl md:text-5xl font-medium mb-2 text-blue">
              Customer Feedback:
            </h1>
            <h1 className="tracking-tight font-normal text-primary text-4xl lg:text-5xl bg-clip-text">
              The Proof of Our 
            </h1>
            <h1 className="tracking-tight font-normal text-primary text-4xl lg:text-5xl bg-clip-text">
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
            className="flex overflow-hidden gap-6"
            style={{ scrollBehavior: 'smooth' }}
          >
            {reviews.map((review, index) => (
              <div
                key={review.id}
                className="min-w-[384px] bg-[#F4F4F4] rounded-xl p-6 shadow-sm flex flex-col justify-between"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={review.image}
                    alt={review.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <span className="text-sm text-gray-400 font-medium">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <div className="mt-4">
                  <div className="flex text-sky-800 text-sm mb-2">
                    {'★'.repeat(review.stars)}
                  </div>
                  <p className="text-sm text-gray-700">{review.text}</p>
                </div>
                <hr className="my-4 border-gray-200" />
                <p className="text-sm font-semibold text-sky-700">
                  {review.name}
                </p>
              </div>
            ))}
          </div>

          {/* Flechas */}
          <div className="mt-10 flex justify-end gap-4">
            <button
              onClick={prev}
              disabled={currentIndex === 0}
              className="w-10 h-10 flex items-center justify-center border border-blue rounded-full hover:bg-white-100 disabled:opacity-30"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={next}
              disabled={currentIndex >= maxIndex}
              className="w-10 h-10 flex items-center justify-center bg-blue text-white rounded-full hover:bg-white-100 disabled:opacity-30"
            >
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
