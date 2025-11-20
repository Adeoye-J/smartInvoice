const Pricing = () => {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      description: 'Perfect for getting started',
      features: [
        'Up to 5 invoices per month',
        'Basic templates',
        'Email support',
        'PDF downloads',
        'Client management'
      ],
      cta: 'Get Started',
      popular: false
    },
    {
      name: 'Professional',
      price: '$12',
      description: 'Best for freelancers',
      features: [
        'Unlimited invoices',
        'Premium templates',
        'Priority support',
        'Payment reminders',
        'Multi-currency',
        'Custom branding',
        'Analytics dashboard'
      ],
      cta: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Business',
      price: '$29',
      description: 'For growing teams',
      features: [
        'Everything in Professional',
        'Team collaboration',
        'API access',
        'White-label options',
        'Dedicated account manager',
        'Advanced analytics',
        'Custom integrations'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ]
  
  return (
    <section className='py-20 lg:py-28 bg-linear-to-br from-gray-50 to-blue-50/30'>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className='text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4'>
            Simple, Transparent Pricing
          </h2>
          <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
            Start free, upgrade when you need more. No hidden fees, cancel anytime.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div key={index} className={`relative bg-white rounded-2xl p-8 ${plan.popular ? 'border-2 border-blue-600 shadow-2xl scale-105' : 'border border-gray-200 shadow-sm'}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-linear-to-r from-blue-600 to-blue-700 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}
              <div className="text-center mb-8">
                <h3 className='text-2xl font-bold text-gray-900 mb-2'>{plan.name}</h3>
                <div className="flex items-baseline justify-center mb-2">
                  <span className='text-5xl font-bold text-gray-900'>{plan.price}</span>
                  <span className='text-gray-600 ml-2'>/month</span>
                </div>
                <p className='text-gray-600'>{plan.description}</p>
              </div>
              
              <ul className='space-y-4 mb-8'>
                {plan.features.map((feature, i) => (
                  <li key={i} className='flex items-start space-x-3'>
                    <CheckCircle className='w-5 h-5 text-green-500 shrink-0 mt-0.5' />
                    <span className='text-gray-600'>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${plan.popular ? 'bg-linear-to-r from-blue-600 to-blue-700 text-white hover:shadow-xl' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Pricing