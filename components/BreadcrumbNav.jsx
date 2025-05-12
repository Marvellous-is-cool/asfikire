import Link from "next/link";
import { FaChevronRight, FaHome } from "react-icons/fa";

export function BreadcrumbNav({ items }) {
  return (
    <nav className="max-w-5xl mx-auto mb-6" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center text-sm text-gray-500">
        <li className="flex items-center">
          <Link
            href="/"
            className="flex items-center hover:text-primary-600 transition-colors"
          >
            <FaHome className="mr-1 h-4 w-4" />
            <span>Home</span>
          </Link>
        </li>

        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            <FaChevronRight className="mx-2 h-3 w-3 text-gray-400" />
            {index === items.length - 1 ? (
              <span className="font-medium text-primary-700">{item.label}</span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-primary-600 transition-colors"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
