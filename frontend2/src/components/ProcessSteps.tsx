import { useEffect, useRef, useState } from 'react'
import './process-steps.css'

const steps = [
  {
    number: 1,
    title: 'Initial Order',
    description: [
      'Log in and submit your request',
      'for background verification',
      'through our streamlined online system.'
    ]
  },
  {
    number: 2,
    title: 'Assigned To Researchers',
    description: [
      'After order submission, our experts',
      '– internal and external researches will',
      'automatically be assigned to research.'
    ]
  },
  {
    number: 3,
    title: 'Report Compiled',
    description: [
      'Later, the researched data',
      'sort out into a clear and comprehensive',
      'draft and share with QA team.'
    ]
  },
  {
    number: 4,
    title: 'QA Review',
    description: [
      'Our well-trained Quality Analysis',
      'team review and verify the of',
      'draft reports for accuracy and compliance.'
    ]
  },
  {
    number: 5,
    title: 'Delivery',
    description: [
      'After thorough verification,',
      'we mail or deliver the final report in a',
      'timely manner to help your decision-making.'
    ]
  }
]

export default function ProcessSteps() {
  const [visibleSteps, setVisibleSteps] = useState<Set<number>>(new Set())
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observers: IntersectionObserver[] = []

    stepRefs.current.forEach((ref, index) => {
      if (ref) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setVisibleSteps((prev) => new Set(prev).add(index))
              }
            })
          },
          {
            threshold: 0.2,
            rootMargin: '0px 0px -100px 0px'
          }
        )
        observer.observe(ref)
        observers.push(observer)
      }
    })

    return () => {
      observers.forEach((observer) => observer.disconnect())
    }
  }, [])

  return (
    <section className="process-steps-section">
      <div className="process-steps-container">
        <h2 className="process-steps-title">Process step by step</h2>
        <p className="process-steps-subtitle">
          Follow our streamlined end-to-end background verification workflow.
        </p>

        <div className="process-timeline">
          {steps.map((step, index) => (
            <div
              key={step.number}
              ref={(el) => (stepRefs.current[index] = el)}
              className={`process-step ${index % 2 === 0 ? 'step-left' : 'step-right'} ${
                visibleSteps.has(index) ? 'visible' : ''
              }`}
            >
              <div className="step-content">
                <div className="step-number-wrapper">
                  <div className="step-number">{step.number}</div>
                  {index < steps.length - 1 && (
                    <div className="step-connector">
                      <div className="connector-line"></div>
                    </div>
                  )}
                </div>
                <div className="step-text">
                  <h3 className="step-title">{step.title}</h3>
                  <div className="step-description">
                    {step.description.map((line, lineIndex) => (
                      <p key={lineIndex}>{line}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}





























